import { Event } from "../models/Event";
import { Registration } from "../models/Registration";
import { AppError } from "../middlewares/error";
import { parsePagination, buildPaginationMeta } from "../utils/pagination";

export const eventsService = {
  async listEvents(query: any) {
    const { skip, limit, page } = parsePagination(query);
    const filter: any = {};

    // Search by title
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    // Filter by status
    if (query.status) {
      filter.status = query.status;
    } else {
      // Default to published for public listing
      filter.status = "published";
    }

    // Filter by date range
    if (query.from) {
      filter.startTime = { ...filter.startTime, $gte: new Date(query.from) };
    }
    if (query.to) {
      filter.startTime = { ...filter.startTime, $lte: new Date(query.to) };
    }

    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate("organizerId", "name email")
        .sort({ startTime: 1 })
        .skip(skip)
        .limit(limit),
      Event.countDocuments(filter),
    ]);

    // Populate registration and check-in counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const [registeredCount, checkedInCount] = await Promise.all([
          Registration.countDocuments({ eventId: event._id, status: { $ne: "cancelled" } }),
          Registration.countDocuments({ eventId: event._id, checkedIn: true }),
        ]);
        
        return {
          ...event.toObject(),
          registeredCount,
          checkedInCount,
        };
      })
    );

    return {
      data: eventsWithCounts,
      meta: buildPaginationMeta(total, page, limit),
    };
  },

  async getEventById(eventId: string) {
    const event = await Event.findById(eventId).populate("organizerId", "name email");
    if (!event) {
      throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
    }
    
    // Add registration and check-in counts
    const [registeredCount, checkedInCount] = await Promise.all([
      Registration.countDocuments({ eventId: event._id, status: { $ne: "cancelled" } }),
      Registration.countDocuments({ eventId: event._id, checkedIn: true }),
    ]);
    
    return {
      ...event.toObject(),
      registeredCount,
      checkedInCount,
    };
  },

  async createEvent(organizerId: string, eventData: any) {
    const event = await Event.create({
      ...eventData,
      organizerId,
    });
    return event;
  },

  async updateEvent(eventId: string, userId: string, userRole: string, updates: any) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
    }

    // Check ownership
    if (event.organizerId.toString() !== userId && userRole !== "admin") {
      throw new AppError(403, "FORBIDDEN", "You don't have permission to update this event");
    }

    Object.assign(event, updates);
    await event.save();
    return event;
  },

  async deleteEvent(eventId: string, userId: string, userRole: string) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
    }

    // Check ownership
    if (event.organizerId.toString() !== userId && userRole !== "admin") {
      throw new AppError(403, "FORBIDDEN", "You don't have permission to delete this event");
    }

    // Soft delete by archiving
    event.status = "archived";
    await event.save();
    return { message: "Event archived successfully" };
  },

  async getOrganizerEvents(organizerId: string, query: any) {
    const { skip, limit, page } = parsePagination(query);
    const filter: any = { organizerId };

    if (query.status) {
      filter.status = query.status;
    }

    const [events, total] = await Promise.all([
      Event.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Event.countDocuments(filter),
    ]);

    // Populate registration and check-in counts for each event
    const eventsWithCounts = await Promise.all(
      events.map(async (event) => {
        const [registeredCount, checkedInCount] = await Promise.all([
          Registration.countDocuments({ eventId: event._id, status: { $ne: "cancelled" } }),
          Registration.countDocuments({ eventId: event._id, checkedIn: true }),
        ]);
        
        return {
          ...event.toObject(),
          registeredCount,
          checkedInCount,
        };
      })
    );

    return {
      data: eventsWithCounts,
      meta: buildPaginationMeta(total, page, limit),
    };
  },
};
