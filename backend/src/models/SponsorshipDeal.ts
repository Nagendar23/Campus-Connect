import { Schema, model, Document, Types } from "mongoose";

export interface IRoiMetrics {
  impressions?: number;
  clicks?: number;
  leads?: number;
  notes?: string;
}

export interface ISponsorshipDeal extends Document {
  sponsorId: Types.ObjectId;
  eventId: Types.ObjectId;
  opportunityId?: Types.ObjectId;
  packageTitle?: string;
  amount: number;
  status: "proposed" | "active" | "completed" | "cancelled";
  signedAt?: Date;
  roi?: IRoiMetrics;
  createdAt: Date;
  updatedAt: Date;
}

const RoiMetricsSchema = new Schema<IRoiMetrics>(
  {
    impressions: { type: Number, min: 0 },
    clicks: { type: Number, min: 0 },
    leads: { type: Number, min: 0 },
    notes: { type: String },
  },
  { _id: false }
);

const SponsorshipDealSchema = new Schema<ISponsorshipDeal>(
  {
    sponsorId: { type: Schema.Types.ObjectId, ref: "Sponsor", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    opportunityId: { type: Schema.Types.ObjectId, ref: "SponsorOpportunity" },
    packageTitle: { type: String },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["proposed", "active", "completed", "cancelled"],
      default: "proposed",
      index: true,
    },
    signedAt: { type: Date },
    roi: { type: RoiMetricsSchema },
  },
  { timestamps: true }
);

SponsorshipDealSchema.index({ sponsorId: 1, eventId: 1 });

export const SponsorshipDeal = model<ISponsorshipDeal>(
  "SponsorshipDeal",
  SponsorshipDealSchema
);
