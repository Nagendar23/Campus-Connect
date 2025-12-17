import { Schema, model, Document, Types } from "mongoose";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  provider: string;
  providerRef?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
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
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    status: {
      type: String,
      enum: ["pending", "succeeded", "failed", "refunded"],
      default: "pending",
      index: true,
    },
    provider: { type: String, default: "mock" },
    providerRef: { type: String },
  },
  { timestamps: true }
);

export const Payment = model<IPayment>("Payment", PaymentSchema);
