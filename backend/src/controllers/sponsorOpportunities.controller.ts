import { Request, Response, NextFunction } from "express";
import { sponsorOpportunitiesService } from "../services/sponsorOpportunities.service";

export const sponsorOpportunitiesController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body || {};
      const item = await sponsorOpportunitiesService.create(data);
      res.status(201).json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await sponsorOpportunitiesService.getById(req.params.id);
      if (!item) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Opportunity not found" } });
      res.status(200).json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "50", eventId, organizerId, status } = req.query as any;
      const filter: any = {};
      if (eventId) filter.eventId = eventId;
      if (organizerId) filter.organizerId = organizerId;
      if (status) filter.status = status;
      const result = await sponsorOpportunitiesService.list(filter, Number(limit), Number(page));
      res.status(200).json({ data: result.data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await sponsorOpportunitiesService.update(req.params.id, req.body || {});
      res.status(200).json({ data: updated });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await sponsorOpportunitiesService.remove(req.params.id);
      res.status(200).json({ data: { message: "Deleted" } });
    } catch (error) {
      next(error);
    }
  },
};
