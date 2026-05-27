import { SponsorOpportunity, ISponsorOpportunity } from "../models/SponsorOpportunity";

export const sponsorOpportunitiesService = {
  async create(data: Partial<ISponsorOpportunity>) {
    return SponsorOpportunity.create(data);
  },

  async getById(id: string) {
    return SponsorOpportunity.findById(id).populate("eventId organizerId").exec();
  },

  async list(filter: any = {}, limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    const items = await SponsorOpportunity.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("eventId organizerId")
      .exec();
    return { data: items };
  },

  async update(id: string, update: Partial<ISponsorOpportunity>) {
    return SponsorOpportunity.findByIdAndUpdate(id, update, { new: true }).exec();
  },

  async remove(id: string) {
    return SponsorOpportunity.findByIdAndDelete(id).exec();
  },
};
