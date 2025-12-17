import { Request, Response, NextFunction } from "express";
import { usersService } from "../services/users.service";
import { AuthRequest } from "../middlewares/auth";

export const usersController = {
  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await usersService.getUserById(id);
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      // Users can only update themselves unless admin
      if (id !== userId && userRole !== "admin") {
        res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "You can only update your own profile",
          },
        });
        return;
      }

      const updates = req.body;
      const user = await usersService.updateUser(id, updates);
      res.status(200).json({ data: user });
    } catch (error) {
      next(error);
    }
  },

  async getOrganizerSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const summary = await usersService.getOrganizerSummary(id);
      res.status(200).json({ data: summary });
    } catch (error) {
      next(error);
    }
  },
};
