import { Schema, model, Document, Types } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description?: string;
  coverImage?: string;
  category?: string;
  location: string;
  startTime: Date;
  endTime: Date;
  capacity: number;
  isPaid: boolean;
  price?: number;
  status: "draft" | "published" | "archived";
  organizerId: Types.ObjectId;
  venue?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true, index: "text" },
    description: { type: String },
    coverImage: { type: String },
    category: { type: String },
    location: { type: String, required: true },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date, required: true },
    capacity: { type: Number, required: true, min: 1 },
    isPaid: { type: Boolean, default: false },
    price: { type: Number, min: 0 },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true,
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    venue: { type: String },
  },
  { timestamps: true }
);

export const Event = model<IEvent>("Event", EventSchema);
