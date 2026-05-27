import { VolunteerAssignment, IVolunteerAssignment } from "../models/VolunteerAssignment";

export const volunteerAssignmentsService = {
  async create(data: Partial<IVolunteerAssignment>) {
    return VolunteerAssignment.create(data);
  },

  async getById(id: string) {
    return VolunteerAssignment.findById(id).populate("volunteerId eventId").exec();
  },

  async list(filter: any = {}, limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    const items = await VolunteerAssignment.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("volunteerId eventId")
      .exec();
    return { data: items };
  },

  async update(id: string, update: Partial<IVolunteerAssignment>) {
    return VolunteerAssignment.findByIdAndUpdate(id, update, { new: true }).exec();
  },

  async remove(id: string) {
    return VolunteerAssignment.findByIdAndDelete(id).exec();
  },
};
