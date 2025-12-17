import { Feedback } from "../models/Feedback";
import { Event } from "../models/Event";
import { Registration } from "../models/Registration";
import { AppError } from "../middlewares/error";

export const feedbackService = {
  async submitFeedback(userId: string, eventId: string, rating: number, comment?: string) {
    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      throw new AppError(404, "EVENT_NOT_FOUND", "Event not found");
    }

    // Check if user has a confirmed registration
    const registration = await Registration.findOne({
      userId,
      eventId,
      status: "confirmed",
    });

    if (!registration) {
      throw new AppError(400, "NOT_REGISTERED", "You must be registered for this event to leave feedback");
    }

    // Check if feedback already exists
    const existing = await Feedback.findOne({ userId, eventId });
    if (existing) {
      throw new AppError(409, "FEEDBACK_EXISTS", "You have already submitted feedback for this event");
    }

    const feedback = await Feedback.create({
      userId,
      eventId,
      rating,
      comment,
    });

    return feedback;
  },

  async getEventFeedback(eventId: string) {
    const feedbacks = await Feedback.find({ eventId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const stats = await Feedback.aggregate([
      { $match: { eventId: eventId as any } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalFeedback: { $sum: 1 },
        },
      },
    ]);

    return {
      feedbacks,
      stats: stats[0] || { avgRating: 0, totalFeedback: 0 },
    };
  },

  async getOrganizerFeedback(organizerId: string) {
    const events = await Event.find({ organizerId }).select("_id title");
    const eventIds = events.map((e) => e._id);

    const feedbacks = await Feedback.find({ eventId: { $in: eventIds } })
      .populate("userId", "name")
      .populate("eventId", "title")
      .sort({ createdAt: -1 })
      .limit(50);

    const stats = await Feedback.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalFeedback: { $sum: 1 },
        },
      },
    ]);

    return {
      feedbacks,
      stats: stats[0] || { avgRating: 0, totalFeedback: 0 },
    };
  },
};
