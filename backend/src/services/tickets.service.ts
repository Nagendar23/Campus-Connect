import { Ticket } from "../models/Ticket";
import { Event } from "../models/Event";
import { AppError } from "../middlewares/error";

export const ticketsService = {
  async getTicketById(ticketId: string, userId: string, userRole: string) {
    try {
      if (!ticketId || typeof ticketId !== 'string') {
        throw new AppError(400, "INVALID_TICKET_ID", "Valid ticket ID is required");
      }

      const ticket = await Ticket.findById(ticketId)
        .populate("userId", "name email")
        .populate("eventId");

      if (!ticket) {
        throw new AppError(404, "TICKET_NOT_FOUND", "Ticket not found");
      }

      // Type-safe access to populated userId
      const populatedUser: any = ticket.userId;
      const ticketUserId = populatedUser?._id?.toString() || ticket.userId.toString();

      // Check access: owner or organizer of the event
      const event = await Event.findById(ticket.eventId);
      if (
        ticketUserId !== userId &&
        event?.organizerId.toString() !== userId &&
        userRole !== "admin"
      ) {
        throw new AppError(403, "FORBIDDEN", "You don't have permission to view this ticket");
      }

      return ticket;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Unexpected error in getTicketById:", error);
      throw new AppError(500, "TICKET_ERROR", "An unexpected error occurred while fetching ticket");
    }
  },

  async getTicketQRCode(ticketId: string, userId: string) {
    try {
      if (!ticketId || typeof ticketId !== 'string') {
        throw new AppError(400, "INVALID_TICKET_ID", "Valid ticket ID is required");
      }

      if (!userId || typeof userId !== 'string') {
        throw new AppError(400, "INVALID_USER_ID", "Valid user ID is required");
      }

      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new AppError(404, "TICKET_NOT_FOUND", "Ticket not found");
      }

      // Only ticket owner can get QR code
      if (ticket.userId.toString() !== userId) {
        throw new AppError(403, "FORBIDDEN", "You don't have permission to access this QR code");
      }

      if (!ticket.qrCode) {
        throw new AppError(500, "QR_CODE_MISSING", "QR code has not been generated for this ticket");
      }

      return {
        token: ticket.qrCode, // Frontend expects 'token' field
        ticketId: ticket._id,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error("Unexpected error in getTicketQRCode:", error);
      throw new AppError(500, "QR_CODE_ERROR", "An unexpected error occurred while fetching QR code");
    }
  },
};
