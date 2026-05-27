import { Certificate, ICertificate } from "../models/Certificate";
import { Types } from "mongoose";

export const certificatesService = {
  async issueCertificate(data: Partial<ICertificate>) {
    return Certificate.create(data);
  },

  async getUserCertificates(userId: string) {
    return Certificate.find({ userId: new Types.ObjectId(userId) }).populate("eventId").exec();
  },

  async getEventCertificates(eventId: string) {
    return Certificate.find({ eventId: new Types.ObjectId(eventId) }).populate("userId").exec();
  },
};
