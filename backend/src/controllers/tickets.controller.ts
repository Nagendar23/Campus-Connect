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
            details: "Ticket ID parameter must be a non-empty string"
          },
        });
        return;
      }

      if (!req.user || !req.user.userId) {
        console.error('Get Ticket - User not authenticated:', { 
          hasReqUser: !!req.user, 
          userId: req.user?.userId 
        });
        res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication required. Please log in again.",
            details: "Valid user authentication is required to access tickets"
          },
        });
        return;
      }

      const userId = req.user.userId;
      const userRole = req.user.role;
      console.log('Fetching ticket:', { ticketId: id, userId, userRole });
      
      const ticket = await ticketsService.getTicketById(id, userId, userRole);
      res.status(200).json({ data: ticket });
    } catch (error) {
      console.error('Get Ticket Error:', error);
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
            details: "Ticket ID parameter must be a non-empty string"
          },
        });
        return;
      }

      if (!req.user || !req.user.userId) {
        console.error('Get Ticket QR Code - User not authenticated:', { 
          hasReqUser: !!req.user, 
          userId: req.user?.userId 
        });
        res.status(401).json({
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication required. Please log in again.",
            details: "Valid user authentication is required to access ticket QR codes"
          },
        });
        return;
      }

      const userId = req.user.userId;
      const userRole = req.user.role;
      console.log('Fetching ticket QR code:', { ticketId: id, userId, userRole });
      
      const result = await ticketsService.getTicketQRCode(id, userId, userRole);
      res.status(200).json({ data: result });
    } catch (error) {
      console.error('Get Ticket QR Code Error:', error);
      next(error);
    }
  },
};
