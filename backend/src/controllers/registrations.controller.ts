import { Request, Response, NextFunction } from "express";
import { registrationsService } from "../services/registrations.service";
import { AuthRequest } from "../middlewares/auth";

export const registrationsController = {
  async registerForEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const result = await registrationsService.registerForEvent(userId, id);
      res.status(201).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  async getUserRegistrations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId;
      const registrations = await registrationsService.getUserRegistrations(userId, req.query);
      res.status(200).json({ data: registrations });
    } catch (error) {
      next(error);
    }
  },

  async getRegistration(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const registration = await registrationsService.getRegistration(id, userId);
      res.status(200).json({ data: registration });
    } catch (error) {
      next(error);
    }
  },

  async getEventRegistrations(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const organizerId = req.user!.userId;
      const registrations = await registrationsService.getEventRegistrations(id, organizerId);
      res.status(200).json({ data: registrations });
    } catch (error) {
      next(error);
    }
  },
};
