import { Request, Response, NextFunction } from "express";
import { analyticsService } from "../services/analytics.service";
import { AuthRequest } from "../middlewares/auth";

export const analyticsController = {
  async getOrganizerOverview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await analyticsService.getOrganizerOverview(id, req.query);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  async getEventAnalytics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizerId = req.user!.userId;
      const result = await analyticsService.getEventAnalytics(id, organizerId);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  },
};
