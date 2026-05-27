import { Request, Response, NextFunction } from "express";
import { sponsorshipDealsService } from "../services/sponsorshipDeals.service";

export const sponsorshipDealsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body || {};
      const item = await sponsorshipDealsService.create(data);
      res.status(201).json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await sponsorshipDealsService.getById(req.params.id);
      if (!item) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Deal not found" } });
      res.status(200).json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "50", eventId, sponsorId, status, opportunityId } = req.query as any;
      const filter: any = {};
      if (eventId) filter.eventId = eventId;
      if (sponsorId) filter.sponsorId = sponsorId;
      if (status) filter.status = status;
      if (opportunityId) filter.opportunityId = opportunityId;
      const result = await sponsorshipDealsService.list(filter, Number(limit), Number(page));
      res.status(200).json({ data: result.data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await sponsorshipDealsService.update(req.params.id, req.body || {});
      res.status(200).json({ data: updated });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await sponsorshipDealsService.remove(req.params.id);
      res.status(200).json({ data: { message: "Deleted" } });
    } catch (error) {
      next(error);
    }
  },
};
