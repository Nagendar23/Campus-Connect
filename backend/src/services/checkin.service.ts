import { Ticket } from "../models/Ticket";
import { Event } from "../models/Event";
import { CheckInLog } from "../models/CheckInLog";
import { AppError } from "../middlewares/error";
import { validateQRToken } from "../utils/qr";
import { parsePagination, buildPaginationMeta } from "../utils/pagination";

export const checkinService = {
  async scanQRCode(token: string, scannerId: string) {
    // Validate QR token
    const validation = validateQRToken(token);
    if (!validation.valid) {
      throw new AppError(400, "INVALID_QR", validation.error);
    }

    const { ticketId, eventId } = validation;

    // Find ticket
    const ticket = await Ticket.findById(ticketId).populate("eventId");
    if (!ticket) {
      throw new AppError(404, "TICKET_NOT_FOUND", "Ticket not found");
    }

    // Verify event match
    if (ticket.eventId._id.toString() !== eventId) {
      throw new AppError(400, "EVENT_MISMATCH", "Ticket does not belong to this event");
    }

    // Check if already checked in (idempotent)
    if (ticket.checkedInAt) {
      return {
        alreadyCheckedIn: true,
        ticketId: ticket._id,
        checkedInAt: ticket.checkedInAt,
        message: "Ticket already checked in",
      };
    }

    // Perform check-in
    ticket.checkedInAt = new Date();
    ticket.checkInMethod = "qr";
    await ticket.save();

    // Create log
    await CheckInLog.create({
      ticketId: ticket._id,
      scannerId,
      method: "qr",
    });

    return {
      alreadyCheckedIn: false,
      ticketId: ticket._id,
      checkedInAt: ticket.checkedInAt,
      message: "Check-in successful",
    };
  },

  async getCheckInHistory(eventId: string, organizerId: string, query: any) {
    // Verify event ownership
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
    }

    if (event.organizerId.toString() !== organizerId) {
      throw new AppError(403, "FORBIDDEN", "You don't have permission to view check-in history");
    }

    const { skip, limit, page } = parsePagination(query);

    // Find all tickets for this event
    const tickets = await Ticket.find({ eventId, checkedInAt: { $ne: null } })
      .sort({ checkedInAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("userId", "name email");

    const total = await Ticket.countDocuments({ eventId, checkedInAt: { $ne: null } });

    return {
      data: tickets,
      meta: buildPaginationMeta(total, page, limit),
    };
  },
};
