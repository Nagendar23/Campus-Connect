import { Schema, model, Document, Types } from "mongoose";

export interface ISponsorOpportunity extends Document {
  eventId: Types.ObjectId;
  organizerId: Types.ObjectId;
  title: string;
  description?: string;
  packageTitle?: string;
  targetAmount?: number;
  categories: string[];
  status: "open" | "closed" | "fulfilled";
  createdAt: Date;
  updatedAt: Date;
}

const SponsorOpportunitySchema = new Schema<ISponsorOpportunity>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String },
    packageTitle: { type: String },
    targetAmount: { type: Number, min: 0 },
    categories: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["open", "closed", "fulfilled"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true }
);

export const SponsorOpportunity = model<ISponsorOpportunity>(
  "SponsorOpportunity",
  SponsorOpportunitySchema
);
