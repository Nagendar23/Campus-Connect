import { Request, Response, NextFunction } from "express";
import { eventsService } from "../services/events.service";
import { AuthRequest } from "../middlewares/auth";

export const eventsController = {
  async listEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await eventsService.listEvents(req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getEventById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const event = await eventsService.getEventById(id);
      res.status(200).json({ data: event });
    } catch (error) {
      next(error);
    }
  },

  async createEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const organizerId = req.user!.userId;
      const event = await eventsService.createEvent(organizerId, req.body);
      res.status(201).json({ data: event });
    } catch (error) {
      next(error);
    }
  },

  async updateEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const event = await eventsService.updateEvent(id, userId, userRole, req.body);
      res.status(200).json({ data: event });
    } catch (error) {
      next(error);
    }
  },

  async deleteEvent(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const result = await eventsService.deleteEvent(id, userId, userRole);
      res.status(200).json({ data: result });
    } catch (error) {
      next(error);
    }
  },

  async getOrganizerEvents(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const result = await eventsService.getOrganizerEvents(id, req.query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
};
