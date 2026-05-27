import { Schema, model, Document, Types } from "mongoose";

export interface IAchievement {
  title: string;
  points?: number;
  awardedAt?: Date;
}

export interface IVolunteer extends Document {
  userId: Types.ObjectId;
  bio?: string;
  skills: string[];
  availability?: string;
  assignedEvents: Types.ObjectId[];
  score: number;
  achievements: IAchievement[];
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerSchema = new Schema<IVolunteer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bio: { type: String },
    skills: { type: [String], default: [] },
    availability: { type: String },
    assignedEvents: [{ type: Schema.Types.ObjectId, ref: "Event" }],
    score: { type: Number, default: 0 },
    achievements: [
      {
        title: { type: String, required: true },
        points: { type: Number, default: 0 },
        awardedAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

export const Volunteer = model<IVolunteer>("Volunteer", VolunteerSchema);
