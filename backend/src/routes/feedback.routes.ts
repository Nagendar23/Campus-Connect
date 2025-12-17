import { Router } from "express";
import { feedbackController } from "../controllers/feedback.controller";
import { authenticate, requireRole, optionalAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { z } from "zod";

const router = Router();

const feedbackSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  }),
});

router.post("/events/:id/feedback", authenticate, validate(feedbackSchema), feedbackController.submitFeedback);
router.get("/events/:id", optionalAuth, feedbackController.getEventFeedback);
router.get("/organizers/:id", authenticate, requireRole("organizer", "admin"), feedbackController.getOrganizerFeedback);

export default router;
