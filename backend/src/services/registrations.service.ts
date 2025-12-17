import { Registration } from "../models/Registration";
import { Event } from "../models/Event";
import { Payment } from "../models/Payment";
import { Ticket } from "../models/Ticket";
import { AppError } from "../middlewares/error";
import { generateQRToken } from "../utils/qr";

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

      const qrCode = generateQRToken(registration._id.toString(), eventId);

      const ticket = await Ticket.create({
        userId,
        eventId,
        registrationId: registration._id,
        qrCode,
      });

      registration.ticketId = ticket._id;
      await registration.save();

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
