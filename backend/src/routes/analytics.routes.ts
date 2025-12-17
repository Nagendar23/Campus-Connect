import { Router } from "express";
import { analyticsController } from "../controllers/analytics.controller";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/organizer/:id/overview", authenticate, requireRole("organizer", "admin"), analyticsController.getOrganizerOverview);
router.get("/events/:id", authenticate, requireRole("organizer", "admin"), analyticsController.getEventAnalytics);

export default router;
