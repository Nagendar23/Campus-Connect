import { Volunteer, IVolunteer } from "../models/Volunteer";
import { Types } from "mongoose";

export const volunteersService = {
  async create(userId: string, data: Partial<IVolunteer>) {
    const v = await Volunteer.create({ userId: new Types.ObjectId(userId), ...data });
    return v;
  },

  async getById(id: string) {
    return Volunteer.findById(id).populate("userId").exec();
  },

  async getByUserId(userId: string) {
    return Volunteer.findOne({ userId: new Types.ObjectId(userId) }).populate("userId").exec();
  },

  async list(filter: any = {}, limit = 50, page = 1) {
    const skip = (page - 1) * limit;
    const items = await Volunteer.find(filter).skip(skip).limit(limit).exec();
    return { data: items };
  },

  async update(id: string, update: Partial<IVolunteer>) {
    return Volunteer.findByIdAndUpdate(id, update, { new: true }).exec();
  },

  async remove(id: string) {
    return Volunteer.findByIdAndDelete(id).exec();
  },
};
