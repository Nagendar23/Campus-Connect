import { Request, Response, NextFunction } from "express";
import { feedbackService } from "../services/feedback.service";
import { AuthRequest } from "../middlewares/auth";

export const feedbackController = {
  async submitFeedback(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { rating, comment } = req.body;
      const feedback = await feedbackService.submitFeedback(userId, id, rating, comment);
      res.status(201).json({ data: feedback });
    } catch (error) {
      next(error);
    }
  },

  async getEventFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await feedbackService.getEventFeedback(id);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  async getOrganizerFeedback(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await feedbackService.getOrganizerFeedback(id);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  },
};
