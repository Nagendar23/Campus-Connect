import { Request, Response, NextFunction } from "express";
import { checkinService } from "../services/checkin.service";
import { AuthRequest } from "../middlewares/auth";

export const checkinController = {
  async scanQRCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { token } = req.body;
      
      // Validate request body
      if (!token || typeof token !== 'string' || token.trim() === '') {
        res.status(400).json({
          error: {
            code: "MISSING_TOKEN",
            message: "QR token is required",
          },
        });
        return;
      }

      // Validate user
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication required",
          },
        });
        return;
      }

      const scannerId = req.user.userId;
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
      
      // Validate user
      if (!req.user || !req.user.userId) {
        res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication required",
          },
        });
        return;
      }

      const organizerId = req.user.userId;
      
      if (!eventId || typeof eventId !== 'string' || eventId.trim() === '') {
        res.status(400).json({
          error: {
            code: "MISSING_EVENT_ID",
            message: "eventId query parameter is required",
          },
        });
        return;
      }

      const result = await checkinService.getCheckInHistory(
        eventId,
        organizerId,
        req.query
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
