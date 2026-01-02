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
            details: "The 'token' field must be a non-empty string"
          },
        });
        return;
      }

      // Validate user authentication
      if (!req.user || !req.user.userId) {
        console.error('Scan QR Code - User not authenticated:', { 
          hasReqUser: !!req.user, 
          userId: req.user?.userId 
        });
        res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication required. Please log in again.",
            details: "Valid user authentication is required to scan QR codes"
          },
        });
        return;
      }

      const scannerId = req.user.userId;
      console.log('Processing QR scan:', { 
        scannerId, 
        scannerRole: req.user.role,
        tokenPrefix: token.substring(0, 10) + '...'
      });
      
      const result = await checkinService.scanQRCode(token, scannerId);
      
      if (result.alreadyCheckedIn) {
        res.status(409).json({ data: result });
      } else {
        res.status(200).json({ data: result });
      }
    } catch (error) {
      console.error('Scan QR Code Error:', error);
      next(error);
    }
  },

  async getCheckInHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.query;
      
      // Validate user authentication
      if (!req.user || !req.user.userId) {
        console.error('Get Check-In History - User not authenticated:', { 
          hasReqUser: !!req.user, 
          userId: req.user?.userId 
        });
        res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication required. Please log in again.",
            details: "Valid user authentication is required to view check-in history"
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
            details: "Please provide a valid event ID"
          },
        });
        return;
      }

      console.log('Fetching check-in history:', { 
        eventId, 
        organizerId,
        organizerRole: req.user.role
      });

      const result = await checkinService.getCheckInHistory(
        eventId,
        organizerId,
        req.query
      );
      res.status(200).json(result);
    } catch (error) {
      console.error('Get Check-In History Error:', error);
      next(error);
    }
  },
};
