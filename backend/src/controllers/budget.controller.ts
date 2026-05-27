import { Request, Response } from "express";
import { budgetService } from "../services/budget.service";

export const budgetController = {
  async addTransaction(req: Request, res: Response) {
    const { eventId, amount, type, category, description, date } = req.body;
    try {
      const t = await budgetService.addTransaction({
        eventId,
        organizerId: req.user!.userId as any,
        amount,
        type,
        category,
        description,
        date: date ? new Date(date) : undefined,
      });
      res.status(201).json(t);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getEventBudget(req: Request, res: Response) {
    try {
      const budget = await budgetService.getEventBudget(req.params.eventId);
      res.json(budget);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getMyBudget(req: Request, res: Response) {
    try {
      const transactions = await budgetService.getOrganizerBudget(req.user!.userId);
      res.json(transactions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
