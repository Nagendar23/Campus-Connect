import { VolunteerTask, IVolunteerTask } from "../models/VolunteerTask";
import { Types } from "mongoose";

export const volunteerTasksService = {
  async list(filter: any = {}, skip = 0, limit = 50) {
    return VolunteerTask.find(filter).skip(skip).limit(limit).exec();
  },

  async create(data: Partial<IVolunteerTask>) {
    return VolunteerTask.create(data);
  },

  async update(id: string, update: Partial<IVolunteerTask>) {
    return VolunteerTask.findByIdAndUpdate(id, update, { new: true }).exec();
  },

  async remove(id: string) {
    return VolunteerTask.findByIdAndDelete(id).exec();
  },
};
