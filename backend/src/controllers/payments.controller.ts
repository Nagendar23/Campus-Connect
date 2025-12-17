import { Request, Response, NextFunction } from "express";
import { paymentsService } from "../services/payments.service";
import { AuthRequest } from "../middlewares/auth";

export const paymentsController = {
  async createPaymentIntent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { eventId } = req.body;
      const result = await paymentsService.createPaymentIntent(userId, eventId);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  async confirmPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId, success } = req.body;
      const result = await paymentsService.confirmPayment(paymentId, success);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  async getPaymentHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const payments = await paymentsService.getPaymentHistory(userId);
      res.status(200).json({ data: payments });
    } catch (error) {
      next(error);
    }
  },

  async getOrganizerPayments(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await paymentsService.getOrganizerPayments(id);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  },
};
