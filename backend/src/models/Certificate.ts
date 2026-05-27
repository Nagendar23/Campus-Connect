import { Schema, model, Document, Types } from "mongoose";

export interface ICertificate extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  role: "student" | "volunteer" | "sponsor";
  certificateUrl: string;
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    role: { type: String, enum: ["student", "volunteer", "sponsor"], required: true },
    certificateUrl: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate certificates for the same user and event
CertificateSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Certificate = model<ICertificate>("Certificate", CertificateSchema);
