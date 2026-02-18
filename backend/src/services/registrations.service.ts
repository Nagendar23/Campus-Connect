import { Registration } from "../models/Registration";
import { Event } from "../models/Event";
import { Payment } from "../models/Payment";
import { Ticket } from "../models/Ticket";
import { AppError } from "../middlewares/error";
import { generateQRToken } from "../utils/qr";
import { emailService } from "./email.service";
import { User } from "../models/User";

export const registrationsService = {
  async registerForEvent(userId: string, eventId: string) {
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
    }


    if (event.status !== "published") {
      throw new AppError(400, "EVENT_NOT_AVAILABLE", "Event is not available for registration");
    }

    // Check if event has ended
    if (new Date(event.endTime) < new Date()) {
      throw new AppError(400, "EVENT_ENDED", "Event has already ended");
    }

    // Check capacity
    const registeredCount = await Registration.countDocuments({
      eventId,
      status: { $in: ["pending", "confirmed"] },
    });

    if (registeredCount >= event.capacity) {
      throw new AppError(400, "EVENT_FULL", "Event is at full capacity");
    }

    // Check if already registered
    const existing = await Registration.findOne({ userId, eventId });
    if (existing) {
      throw new AppError(409, "ALREADY_REGISTERED", "You are already registered for this event");
    }

    // Create registration
    if (event.isPaid) {
      // Paid event - create pending registration and payment
      const registration = await Registration.create({
        userId,
        eventId,
        status: "pending",
      });

      const payment = await Payment.create({
        userId,
        eventId,
        amount: event.price || 0,
        status: "pending",
        provider: "mock",
      });

      return {
        registration,
        payment,
        requiresPayment: true,
      };
    } else {
      // Free event - create confirmed registration and ticket immediately
      const registration = await Registration.create({
        userId,
        eventId,
        status: "confirmed",
      });

      // Create ticket first to get ID
      const ticket = await Ticket.create({
        userId,
        eventId,
        registrationId: registration._id,
        qrCode: "pending", // placeholder
      });

      const qrCode = generateQRToken(ticket._id.toString(), eventId);
      ticket.qrCode = qrCode;
      await ticket.save();

      registration.ticketId = ticket._id;
      await registration.save();

      // Send confirmation email
      try {
        const user = await User.findById(userId);
        if (user) {
          await emailService.sendRegistrationEmail(
            user.email,
            user.name,
            event.title,
            event.startTime,
            ticket._id.toString()
          );
        }
      } catch (err) {
        console.error("Failed to send registration email:", err);
      }

      return {
        registration,
        ticket,
        requiresPayment: false,
      };
    }
  },

  async getUserRegistrations(userId: string, query: any) {
    const registrations = await Registration.find({ userId })
      .populate("eventId")
      .populate("ticketId")
      .sort({ createdAt: -1 });

    return registrations;
  },

  async getRegistration(registrationId: string, userId: string) {
    const registration = await Registration.findById(registrationId)
      .populate("eventId")
      .populate("ticketId");

    if (!registration) {
      throw new AppError(404, "REGISTRATION_NOT_FOUND", "Registration not found");
    }

    // Verify ownership
    if (registration.userId.toString() !== userId) {
      throw new AppError(403, "FORBIDDEN", "You don't have permission to view this registration");
    }

    return registration;
  },

  async getEventRegistrations(eventId: string, organizerId: string) {
    // Verify event ownership
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
    }

    if (event.organizerId.toString() !== organizerId) {
      throw new AppError(403, "FORBIDDEN", "You don't have permission to view these registrations");
    }

    const registrations = await Registration.find({ eventId })
      .populate("userId", "name email")
      .populate("ticketId")
      .sort({ createdAt: -1 });

    return registrations;
  },
};
