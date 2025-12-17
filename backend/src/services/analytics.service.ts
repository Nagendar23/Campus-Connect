import { Event } from "../models/Event";
import { Registration } from "../models/Registration";
import { Ticket } from "../models/Ticket";
import { Payment } from "../models/Payment";
import { AppError } from "../middlewares/error";

export const analyticsService = {
  async getOrganizerOverview(organizerId: string, query: any) {
    const filter: any = { organizerId };

    // Date range filter
    if (query.from || query.to) {
      filter.startTime = {};
      if (query.from) filter.startTime.$gte = new Date(query.from);
      if (query.to) filter.startTime.$lte = new Date(query.to);
    }

    const events = await Event.find(filter);
    const eventIds = events.map((e) => e._id);

    const [registrations, attendees, payments] = await Promise.all([
      Registration.countDocuments({ eventId: { $in: eventIds } }),
      Ticket.countDocuments({ eventId: { $in: eventIds }, checkedInAt: { $ne: null } }),
      Payment.aggregate([
        { $match: { eventId: { $in: eventIds }, status: "succeeded" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const totalRevenue = payments[0]?.total || 0;
    const checkInRate =
      registrations > 0 ? ((attendees / registrations) * 100).toFixed(2) : "0.00";

    return {
      totalEvents: events.length,
      totalRegistrations: registrations,
      totalAttendees: attendees,
      totalRevenue,
      checkInRate: parseFloat(checkInRate),
    };
  },

  async getEventAnalytics(eventId: string, organizerId: string) {
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
    }

    if (event.organizerId.toString() !== organizerId) {
      throw new AppError(403, "FORBIDDEN", "You don't have permission to view these analytics");
    }

    const [totalRegistrations, totalAttendees, registrationsByDay] = await Promise.all([
      Registration.countDocuments({ eventId }),
      Ticket.countDocuments({ eventId, checkedInAt: { $ne: null } }),
      Registration.aggregate([
        { $match: { eventId: eventId as any } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const checkInRate =
      totalRegistrations > 0
        ? ((totalAttendees / totalRegistrations) * 100).toFixed(2)
        : "0.00";

    return {
      event: {
        id: event._id,
        title: event.title,
        capacity: event.capacity,
      },
      totalRegistrations,
      totalAttendees,
      checkInRate: parseFloat(checkInRate),
      registrationsByDay,
      capacityUtilization: ((totalRegistrations / event.capacity) * 100).toFixed(2),
    };
  },
};
