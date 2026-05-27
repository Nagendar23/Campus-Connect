import { Sponsor, ISponsor } from "../models/Sponsor";
import { Types } from "mongoose";

export const sponsorsService = {
  async create(data: Partial<ISponsor> & { userId?: string }) {
    const payload = { ...data } as any;
    if (payload.userId && typeof payload.userId === "string") {
      payload.userId = new Types.ObjectId(payload.userId);
    }
    const s = await Sponsor.create(payload);
    return s;
  },

  async getById(id: string) {
    return Sponsor.findById(id).exec();
  },

  async getByUserId(userId: string) {
    return Sponsor.findOne({ userId: new Types.ObjectId(userId) }).exec();
  },

  async list(filter: any = {}, limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    const items = await Sponsor.find(filter).skip(skip).limit(limit).exec();
    return { data: items };
  },

  async update(id: string, update: Partial<ISponsor>) {
    return Sponsor.findByIdAndUpdate(id, update, { new: true }).exec();
  },

  async remove(id: string) {
    return Sponsor.findByIdAndDelete(id).exec();
  },
};
