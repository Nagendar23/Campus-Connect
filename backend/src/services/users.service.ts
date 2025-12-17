import { User } from "../models/User";
import { Event } from "../models/Event";
import { Registration } from "../models/Registration";
import { Payment } from "../models/Payment";
import { AppError } from "../middlewares/error";

export const usersService = {
  async getUserById(userId: string) {
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }
    return user;
  },

  async updateUser(userId: string, updates: { name?: string; email?: string; phone?: string; avatarUrl?: string }) {
    // Only allow updating specific fields
    const allowedUpdates: any = {};
    if (updates.name !== undefined) allowedUpdates.name = updates.name;
    if (updates.email !== undefined) allowedUpdates.email = updates.email;
    if (updates.phone !== undefined) allowedUpdates.phone = updates.phone;
    if (updates.avatarUrl !== undefined) allowedUpdates.avatarUrl = updates.avatarUrl;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    if (!user) {
      throw new AppError(404, "USER_NOT_FOUND", "User not found");
    }
    return user;
  },

  async getOrganizerSummary(organizerId: string) {
    const user = await User.findById(organizerId);
    if (!user || user.role !== "organizer") {
      throw new AppError(404, "ORGANIZER_NOT_FOUND", "Organizer not found");
    }

    const events = await Event.find({ organizerId });
    const eventIds = events.map((e) => e._id);

    const registrations = await Registration.countDocuments({
      eventId: { $in: eventIds },
      status: "confirmed",
    });

    const attendees = await Registration.countDocuments({
      eventId: { $in: eventIds },
      status: "confirmed",
    });

    const payments = await Payment.aggregate([
      { $match: { eventId: { $in: eventIds }, status: "succeeded" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const revenue = payments[0]?.total || 0;

    return {
      organizer: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      stats: {
        totalEvents: events.length,
        totalRegistrations: registrations,
        totalAttendees: attendees,
        totalRevenue: revenue,
      },
    };
  },
};
