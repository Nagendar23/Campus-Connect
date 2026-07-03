import { Request, Response, NextFunction } from "express";
import { volunteersService } from "../services/volunteers.service";
import { AuthRequest } from "../middlewares/auth";

export const volunteersController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as AuthRequest).user?.userId;
      const data = req.body || {};
      if (!userId) {
        return res.status(401).json({ error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
      }
      const v = await volunteersService.create(userId, data);
      res.status(201).json({ data: v });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const v = await volunteersService.getById(req.params.id);
      if (!v) return res.status(404).json({ error: { code: "NOT_FOUND", message: "Volunteer not found" } });
      res.status(200).json({ data: v });
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
      let v = await volunteersService.getByUserId(userId);
      if (!v) {
        if (authUser?.role === "volunteer") {
          v = await volunteersService.create(userId, {});
        } else {
          return res.status(404).json({ error: { code: "NOT_FOUND", message: "Volunteer profile not found" } });
        }
      }
      res.status(200).json({ data: v });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = "1", limit = "50" } = req.query as any;
      const result = await volunteersService.list({}, Number(limit), Number(page));
      res.status(200).json({ data: result.data });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await volunteersService.update(req.params.id, req.body || {});
      res.status(200).json({ data: updated });
    } catch (error) {
      next(error);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await volunteersService.remove(req.params.id);
      res.status(200).json({ data: { message: "Deleted" } });
    } catch (error) {
      next(error);
    }
  },
};
