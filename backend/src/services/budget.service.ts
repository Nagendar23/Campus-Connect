import { BudgetTransaction, IBudgetTransaction } from "../models/BudgetTransaction";
import { Types } from "mongoose";

export const budgetService = {
  async addTransaction(data: Partial<IBudgetTransaction>) {
    return BudgetTransaction.create(data);
  },

  async getEventBudget(eventId: string) {
    const transactions = await BudgetTransaction.find({ eventId: new Types.ObjectId(eventId) }).exec();
    const summary = transactions.reduce(
      (acc, t) => {
        if (t.type === "income") acc.income += t.amount;
        else acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    );
    return { transactions, summary };
  },

  async getOrganizerBudget(organizerId: string) {
    return BudgetTransaction.find({ organizerId: new Types.ObjectId(organizerId) }).populate("eventId").exec();
  },
};
