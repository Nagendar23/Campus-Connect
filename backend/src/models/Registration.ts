import { Schema, model, Document, Types } from "mongoose";

export interface IRegistration extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  status: "pending" | "confirmed" | "cancelled";
  ticketId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
      index: true,
    },
    ticketId: { type: Schema.Types.ObjectId, ref: "Ticket" },
  },
  { timestamps: true }
);

// Prevent duplicate registrations
RegistrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Registration = model<IRegistration>(
  "Registration",
  RegistrationSchema
);
