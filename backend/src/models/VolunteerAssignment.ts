import { Schema, model, Document, Types } from "mongoose";

export interface IVolunteerAssignment extends Document {
  volunteerId: Types.ObjectId;
  eventId: Types.ObjectId;
  roleTitle?: string;
  status: "assigned" | "confirmed" | "completed" | "cancelled";
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerAssignmentSchema = new Schema<IVolunteerAssignment>(
  {
    volunteerId: { type: Schema.Types.ObjectId, ref: "Volunteer", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    roleTitle: { type: String },
    status: {
      type: String,
      enum: ["assigned", "confirmed", "completed", "cancelled"],
      default: "assigned",
      index: true,
    },
    startTime: { type: Date },
    endTime: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

VolunteerAssignmentSchema.index({ volunteerId: 1, eventId: 1, roleTitle: 1 });

export const VolunteerAssignment = model<IVolunteerAssignment>(
  "VolunteerAssignment",
  VolunteerAssignmentSchema
);
