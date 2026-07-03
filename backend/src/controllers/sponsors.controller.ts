import { Request, Response, NextFunction } from "express";
import { sponsorsService } from "../services/sponsors.service";
import { AuthRequest } from "../middlewares/auth";

export const sponsorsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      const data = req.body || {};
      if (userId && !data.userId) {
        data.userId = userId;
      }
      const s = await sponsorsService.create(data);
      res.status(201).json({ data: s });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const s = await sponsorsService.getById(req.params.id);
      if (!s) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Sponsor not found" } });
      res.status(200).json({ data: s });
    } catch (error) {
      next(error);
    }
  },

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user;
      const userId = authUser?.userId;
      if (!userId) {
        return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
      }
      let s = await sponsorsService.getByUserId(userId);
      if (!s) {
        if (authUser?.role === "sponsor") {
          const user = await import("../models/User").then(m => m.User.findById(userId));
          s = await sponsorsService.create({ userId, companyName: user?.name || "My Company" });
        } else {
          return res.status(404).json({ error: { code: "NOT_FOUND", message: "Sponsor profile not found" } });
        }
      }
      res.status(200).json({ data: s });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "50" } = req.query as any;
      const result = await sponsorsService.list({}, Number(limit), Number(page));
      res.status(200).json({ data: result.data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await sponsorsService.update(req.params.id, req.body || {});
      res.status(200).json({ data: updated });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await sponsorsService.remove(req.params.id);
      res.status(200).json({ data: { message: "Deleted" } });
    } catch (error) {
      next(error);
    }
  },
};
