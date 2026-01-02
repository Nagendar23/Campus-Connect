import { Ticket } from "../models/Ticket";
import { Event } from "../models/Event";
import { CheckInLog } from "../models/CheckInLog";
import { AppError } from "../middlewares/error";
import { validateQRToken } from "../utils/qr";
import { parsePagination, buildPaginationMeta } from "../utils/pagination";

export const checkinService = {
  async scanQRCode(token: string, scannerId: string) {
    try {
      // Validate QR token
      if (!token || typeof token !== 'string' || token.trim() === '') {
        throw new AppError(400, "INVALID_QR", "QR token is required and must be a valid string");
      }

      const validation = validateQRToken(token);
      if (!validation.valid) {
        throw new AppError(400, "INVALID_QR", validation.error || "Invalid QR code format");
      }

      const { ticketId, eventId } = validation;

      // Validate extracted data
      if (!ticketId || !eventId) {
        throw new AppError(400, "INVALID_QR_DATA", "QR code does not contain valid ticket or event information");
      }

      // Find ticket and populate user and event
      const ticket = await Ticket.findById(ticketId)
        .populate("userId", "name email avatarUrl")
        .populate("eventId");

      if (!ticket) {
        throw new AppError(404, "TICKET_NOT_FOUND", "Ticket not found. This QR code may be invalid or the ticket has been deleted.");
      }

      // Type-safe access to populated fields
      const populatedEvent: any = ticket.eventId;
      const populatedUser: any = ticket.userId;

      if (!populatedEvent || !populatedEvent._id) {
        throw new AppError(500, "EVENT_DATA_ERROR", "Event information could not be retrieved");
      }

      if (!populatedUser || !populatedUser._id) {
        throw new AppError(500, "USER_DATA_ERROR", "User information could not be retrieved");
      }

      // Verify event match
      const ticketEventId = populatedEvent._id.toString();
      if (ticketEventId !== eventId) {
        throw new AppError(400, "EVENT_MISMATCH", "This ticket is not valid for the scanned event");
      }

      // Check if already checked in (idempotent)
      if (ticket.checkedInAt) {
        return {
          alreadyCheckedIn: true,
          ticketId: ticket._id,
          checkedInAt: ticket.checkedInAt,
          message: "This ticket has already been checked in",
          user: populatedUser,
          event: populatedEvent,
        };
      }

      // Perform check-in
      ticket.checkedInAt = new Date();
      ticket.checkInMethod = "qr";
      await ticket.save();

      // Create log with error handling
      try {
        await CheckInLog.create({
          ticketId: ticket._id,
          scannerId,
          method: "qr",
        });
      } catch (logError) {
        console.error("Failed to create check-in log:", logError);
        // Don't fail the check-in if logging fails
      }

      return {
        alreadyCheckedIn: false,
        ticketId: ticket._id,
        checkedInAt: ticket.checkedInAt,
        message: "Check-in successful",
        user: populatedUser,
        event: populatedEvent,
      };
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      // Handle unexpected errors
      console.error("Unexpected error in scanQRCode:", error);
      throw new AppError(500, "CHECKIN_ERROR", "An unexpected error occurred during check-in");
    }
  },

  async getCheckInHistory(eventId: string, organizerId: string, query: any) {
    try {
      // Validate inputs
      if (!eventId || typeof eventId !== 'string') {
        throw new AppError(400, "INVALID_EVENT_ID", "Valid event ID is required");
      }

      if (!organizerId || typeof organizerId !== 'string') {
        throw new AppError(400, "INVALID_ORGANIZER_ID", "Valid organizer ID is required");
      }

      // Verify event ownership
      const event = await Event.findById(eventId);
      if (!event) {
        throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
      }

      if (event.organizerId.toString() !== organizerId) {
        throw new AppError(403, "FORBIDDEN", "You don't have permission to view check-in history for this event");
      }

      const { skip, limit, page } = parsePagination(query);

      // 1. Find all ticket IDs for this event
      const eventTickets = await Ticket.find({ eventId }).select('_id');
      const eventTicketIds = eventTickets.map(t => t._id);

      // 2. Find logs associated with these tickets
      const [logs, total] = await Promise.all([
        CheckInLog.find({ ticketId: { $in: eventTicketIds } })
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .populate({
            path: 'ticketId',
            populate: {
              path: 'userId',
              select: 'name email avatarUrl'
            }
          })
          .populate('scannerId', 'name')
          .lean(),
        CheckInLog.countDocuments({ ticketId: { $in: eventTicketIds } })
      ]);

      return {
        data: logs,
        meta: buildPaginationMeta(total, page, limit),
      };
    } catch (error) {
      // Re-throw AppError instances
      if (error instanceof AppError) {
        throw error;
      }
      // Handle unexpected errors
      console.error("Unexpected error in getCheckInHistory:", error);
      throw new AppError(500, "HISTORY_ERROR", "An unexpected error occurred while fetching check-in history");
    }
  },
};
