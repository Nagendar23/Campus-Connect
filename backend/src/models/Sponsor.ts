import { Schema, model, Document, Types } from "mongoose";

export interface ISponsorshipPackage {
  title: string;
  amount: number;
  description?: string;
}

export interface ISponsor extends Document {
  userId?: Types.ObjectId;
  companyName: string;
  website?: string;
  industry?: string;
  contactEmail?: string;
  packages: ISponsorshipPackage[];
  interestedCategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

const SponsorshipPackageSchema = new Schema<ISponsorshipPackage>(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    description: { type: String },
  },
  { _id: false }
);

const SponsorSchema = new Schema<ISponsor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    companyName: { type: String, required: true, index: true },
    website: { type: String },
    industry: { type: String },
    contactEmail: { type: String },
    packages: { type: [SponsorshipPackageSchema], default: [] },
    interestedCategories: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const Sponsor = model<ISponsor>("Sponsor", SponsorSchema);
