import { SponsorshipDeal, ISponsorshipDeal } from "../models/SponsorshipDeal";

export const sponsorshipDealsService = {
  async create(data: Partial<ISponsorshipDeal>) {
    return SponsorshipDeal.create(data);
  },

  async getById(id: string) {
    return SponsorshipDeal.findById(id)
      .populate("sponsorId eventId opportunityId")
      .exec();
  },

  async list(filter: any = {}, limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    const items = await SponsorshipDeal.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("sponsorId eventId opportunityId")
      .exec();
    return { data: items };
  },

  async update(id: string, update: Partial<ISponsorshipDeal>) {
    return SponsorshipDeal.findByIdAndUpdate(id, update, { new: true }).exec();
  },

  async remove(id: string) {
    return SponsorshipDeal.findByIdAndDelete(id).exec();
  },
};
