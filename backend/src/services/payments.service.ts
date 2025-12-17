import { Payment } from "../models/Payment";
import { Event } from "../models/Event";
import { Registration } from "../models/Registration";
import { Ticket } from "../models/Ticket";
import { AppError } from "../middlewares/error";
import { generateQRToken } from "../utils/qr";
import crypto from "crypto";

export const paymentsService = {
  async createPaymentIntent(userId: string, eventId: string) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
    }

    if (!event.isPaid) {
      throw new AppError(400, "EVENT_NOT_PAID", "This event is free");
    }

    // Check if already has a pending payment
    const existingPayment = await Payment.findOne({
      userId,
      eventId,
      status: "pending",
    });

    if (existingPayment) {
      return {
        paymentId: existingPayment._id,
        clientSecret: `mock_${existingPayment._id}`,
        amount: existingPayment.amount,
      };
    }

    const payment = await Payment.create({
      userId,
      eventId,
      amount: event.price || 0,
      status: "pending",
      provider: "mock",
    });

    return {
      paymentId: payment._id,
      clientSecret: `mock_${payment._id}`,
      amount: payment.amount,
    };
  },

  async confirmPayment(paymentId: string, success: boolean) {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      throw new AppError(404, "PAYMENT_NOT_FOUND", "Payment not found");
    }

    if (payment.status !== "pending") {
      throw new AppError(400, "PAYMENT_ALREADY_PROCESSED", "Payment already processed");
    }

    if (success) {
      payment.status = "succeeded";
      payment.providerRef = `mock_${crypto.randomBytes(8).toString("hex")}`;
      await payment.save();

      // Update registration to confirmed
      const registration = await Registration.findOne({
        userId: payment.userId,
        eventId: payment.eventId,
      });

      if (registration) {
        registration.status = "confirmed";

        // Generate ticket
        const qrCode = generateQRToken(
          registration._id.toString(),
          payment.eventId.toString()
        );

        const ticket = await Ticket.create({
          userId: payment.userId,
          eventId: payment.eventId,
          registrationId: registration._id,
          qrCode,
        });

        registration.ticketId = ticket._id;
        await registration.save();

        return {
          payment,
          registration,
          ticket,
        };
      }
    } else {
      payment.status = "failed";
      await payment.save();

      // Cancel registration if exists
      await Registration.updateOne(
        { userId: payment.userId, eventId: payment.eventId },
        { status: "cancelled" }
      );
    }

    return { payment };
  },

  async getPaymentHistory(userId: string) {
    const payments = await Payment.find({ userId })
      .populate("eventId", "title startTime")
      .sort({ createdAt: -1 });

    return payments;
  },

  async getOrganizerPayments(organizerId: string) {
    const events = await Event.find({ organizerId }).select("_id");
    const eventIds = events.map((e) => e._id);

    const payments = await Payment.find({
      eventId: { $in: eventIds },
      status: "succeeded",
    })
      .populate("userId", "name email")
      .populate("eventId", "title")
      .sort({ createdAt: -1 });

    const stats = await Payment.aggregate([
      { $match: { eventId: { $in: eventIds }, status: "succeeded" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
          totalTransactions: { $sum: 1 },
        },
      },
    ]);

    return {
      payments,
      stats: stats[0] || { totalRevenue: 0, totalTransactions: 0 },
    };
  },
};
