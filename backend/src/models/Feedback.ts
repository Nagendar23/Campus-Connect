import { Schema, model, Document, Types } from "mongoose";

export interface IFeedback extends Document {
  userId: Types.ObjectId;
  eventId: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<IFeedback>(
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
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

// One feedback per user per event
FeedbackSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const Feedback = model<IFeedback>("Feedback", FeedbackSchema);
