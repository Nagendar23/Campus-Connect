import { Schema, model, Document, Types } from "mongoose";

export interface IVolunteerApplication extends Document {
  volunteerId: Types.ObjectId;
  eventId: Types.ObjectId;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  motivation?: string;
  availability?: string;
  skillsSnapshot: string[];
  appliedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerApplicationSchema = new Schema<IVolunteerApplication>(
  {
    volunteerId: { type: Schema.Types.ObjectId, ref: "Volunteer", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "withdrawn"],
      default: "pending",
      index: true,
    },
    motivation: { type: String },
    availability: { type: String },
    skillsSnapshot: { type: [String], default: [] },
    appliedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

VolunteerApplicationSchema.index({ volunteerId: 1, eventId: 1 }, { unique: true });

export const VolunteerApplication = model<IVolunteerApplication>(
  "VolunteerApplication",
  VolunteerApplicationSchema
);
