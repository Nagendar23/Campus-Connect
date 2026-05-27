import { VolunteerApplication, IVolunteerApplication } from "../models/VolunteerApplication";

export const volunteerApplicationsService = {
  async create(data: Partial<IVolunteerApplication>) {
    return VolunteerApplication.create(data);
  },

  async getById(id: string) {
    return VolunteerApplication.findById(id).populate("volunteerId eventId").exec();
  },

  async list(filter: any = {}, limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    const items = await VolunteerApplication.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("volunteerId eventId")
      .exec();
    return { data: items };
  },

  async update(id: string, update: Partial<IVolunteerApplication>) {
    return VolunteerApplication.findByIdAndUpdate(id, update, { new: true }).exec();
  },

  async remove(id: string) {
    return VolunteerApplication.findByIdAndDelete(id).exec();
  },
};
