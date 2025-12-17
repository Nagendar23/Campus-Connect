import { Schema, model, Document, Types } from "mongoose";

export interface ICheckInLog extends Document {
  ticketId: Types.ObjectId;
  scannerId?: Types.ObjectId;
  method: "qr" | "manual";
  timestamp: Date;
}

const CheckInLogSchema = new Schema<ICheckInLog>(
  {
    ticketId: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    scannerId: { type: Schema.Types.ObjectId, ref: "User" },
    method: { type: String, enum: ["qr", "manual"], required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const CheckInLog = model<ICheckInLog>("CheckInLog", CheckInLogSchema);
