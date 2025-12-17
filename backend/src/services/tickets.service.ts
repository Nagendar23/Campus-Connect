import { Ticket } from "../models/Ticket";
import { Event } from "../models/Event";
import { AppError } from "../middlewares/error";

export const ticketsService = {
  async getTicketById(ticketId: string, userId: string, userRole: string) {
    const ticket = await Ticket.findById(ticketId)
      .populate("userId", "name email")
      .populate("eventId");

    if (!ticket) {
      throw new AppError(404, "TICKET_NOT_FOUND", "Ticket not found");
    }

    // Check access: owner or organizer of the event
    const event = await Event.findById(ticket.eventId);
    if (
      ticket.userId._id.toString() !== userId &&
      event?.organizerId.toString() !== userId &&
      userRole !== "admin"
    ) {
      throw new AppError(403, "FORBIDDEN", "You don't have permission to view this ticket");
    }

    return ticket;
  },

  async getTicketQRCode(ticketId: string, userId: string) {
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new AppError(404, "TICKET_NOT_FOUND", "Ticket not found");
    }

    // Only ticket owner can get QR code
    if (ticket.userId.toString() !== userId) {
      throw new AppError(403, "FORBIDDEN", "You don't have permission to access this QR code");
    }

    return {
      ticketId: ticket._id,
      qrCode: ticket.qrCode,
    };
  },
};
