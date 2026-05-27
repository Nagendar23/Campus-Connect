import { Schema, model, Types } from "mongoose";

export interface IVolunteerTask {
  title: string;
  description?: string;
  assignedTo?: Types.ObjectId; // references Volunteer._id
  eventId?: Types.ObjectId;
  status: "todo" | "in_progress" | "done";
  metadata?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const VolunteerTaskSchema = new Schema<IVolunteerTask>(
  {
    title: { type: String, required: true },
    description: { type: String },
    assignedTo: { type: Types.ObjectId, ref: "Volunteer" },
    eventId: { type: Types.ObjectId, ref: "Event" },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const VolunteerTask = model<IVolunteerTask>("VolunteerTask", VolunteerTaskSchema);
