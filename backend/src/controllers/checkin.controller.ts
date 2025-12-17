import { Request, Response, NextFunction } from "express";
import { checkinService } from "../services/checkin.service";
import { AuthRequest } from "../middlewares/auth";

export const checkinController = {
  async scanQRCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      const scannerId = req.user!.userId;
      const result = await checkinService.scanQRCode(token, scannerId);
      
      if (result.alreadyCheckedIn) {
        res.status(409).json({ data: result });
      } else {
        res.status(200).json({ data: result });
      }
    } catch (error) {
      next(error);
    }
  },

  async getCheckInHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.query;
      const organizerId = req.user!.userId;
      
      if (!eventId) {
        res.status(400).json({
          error: {
            code: "MISSING_EVENT_ID",
            message: "eventId query parameter is required",
          },
        });
        return;
      }

      const result = await checkinService.getCheckInHistory(
        eventId as string,
        organizerId,
        req.query
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
