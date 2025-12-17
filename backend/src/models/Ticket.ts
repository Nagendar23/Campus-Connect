import { Schema, model, Document, Types } from "mongoose";

export interface ITicket extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  registrationId: Types.ObjectId;
  qrCode: string;
  issuedAt: Date;
  checkedInAt?: Date;
  checkInMethod?: "qr" | "manual" | null;
  createdAt: Date;
  updatedAt: Date;
}

const TicketSchema = new Schema<ITicket>(
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
    registrationId: {
      type: Schema.Types.ObjectId,
      ref: "Registration",
      required: true,
      unique: true,
    },
    qrCode: { type: String, required: true, unique: true },
    issuedAt: { type: Date, default: Date.now },
    checkedInAt: { type: Date },
    checkInMethod: {
      type: String,
      enum: ["qr", "manual", null],
      default: null,
    },
  },
  { timestamps: true }
);

export const Ticket = model<ITicket>("Ticket", TicketSchema);
