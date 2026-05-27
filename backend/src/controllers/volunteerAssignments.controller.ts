import { Request, Response, NextFunction } from "express";
import { volunteerAssignmentsService } from "../services/volunteerAssignments.service";

export const volunteerAssignmentsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body || {};
      const item = await volunteerAssignmentsService.create(data);
      res.status(201).json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await volunteerAssignmentsService.getById(req.params.id);
      if (!item) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Assignment not found" } });
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
      const result = await volunteerAssignmentsService.list(filter, Number(limit), Number(page));
      res.status(200).json({ data: result.data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await volunteerAssignmentsService.update(req.params.id, req.body || {});
      res.status(200).json({ data: updated });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await volunteerAssignmentsService.remove(req.params.id);
      res.status(200).json({ data: { message: "Deleted" } });
    } catch (error) {
      next(error);
    }
  },
};
