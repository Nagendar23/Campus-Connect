import { Schema, model, Document, Types } from "mongoose";

export interface IBudgetTransaction extends Document {
  eventId: Types.ObjectId;
  organizerId: Types.ObjectId;
  amount: number;
  type: "income" | "expense";
  category: string;
  description: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetTransactionSchema = new Schema<IBudgetTransaction>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    organizerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const BudgetTransaction = model<IBudgetTransaction>("BudgetTransaction", BudgetTransactionSchema);
