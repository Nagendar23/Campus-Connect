import { Request, Response, NextFunction } from "express";
import { ticketsService } from "../services/tickets.service";
import { AuthRequest } from "../middlewares/auth";

export const ticketsController = {
  async getTicketById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Validate request
      if (!id || typeof id !== 'string' || id.trim() === '') {
        res.status(400).json({
          error: {
            code: "INVALID_TICKET_ID",
            message: "Valid ticket ID is required",
          },
        });
        return;
      }

      if (!req.user || !req.user.userId) {
        res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication required",
          },
        });
        return;
      }

      const userId = req.user.userId;
      const userRole = req.user.role;
      const ticket = await ticketsService.getTicketById(id, userId, userRole);
      res.status(200).json({ data: ticket });
    } catch (error) {
      next(error);
    }
  },

  async getTicketQRCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      // Validate request
      if (!id || typeof id !== 'string' || id.trim() === '') {
        res.status(400).json({
          error: {
            code: "INVALID_TICKET_ID",
            message: "Valid ticket ID is required",
          },
        });
        return;
      }

      if (!req.user || !req.user.userId) {
        res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication required",
          },
        });
        return;
      }

      const userId = req.user.userId;
      const result = await ticketsService.getTicketQRCode(id, userId);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  },
};
