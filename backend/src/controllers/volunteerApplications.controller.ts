import { Request, Response, NextFunction } from "express";
import { volunteerApplicationsService } from "../services/volunteerApplications.service";

export const volunteerApplicationsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body || {};
      const item = await volunteerApplicationsService.create(data);
      res.status(201).json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await volunteerApplicationsService.getById(req.params.id);
      if (!item) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Application not found" } });
      res.status(200).json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "50", eventId, volunteerId, status } = req.query as any;
      const filter: any = {};
      if (eventId) filter.eventId = eventId;
      if (volunteerId) filter.volunteerId = volunteerId;
      if (status) filter.status = status;
      const result = await volunteerApplicationsService.list(filter, Number(limit), Number(page));
      res.status(200).json({ data: result.data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await volunteerApplicationsService.update(req.params.id, req.body || {});
      res.status(200).json({ data: updated });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await volunteerApplicationsService.remove(req.params.id);
      res.status(200).json({ data: { message: "Deleted" } });
    } catch (error) {
      next(error);
    }
  },
};
