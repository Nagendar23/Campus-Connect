import { Router } from "express";
import { authenticate, requireRole } from "../middlewares/auth";
import { eventsController } from "../controllers/events.controller";
import { feedbackController } from "../controllers/feedback.controller";
import { paymentsController } from "../controllers/payments.controller";
import { usersController } from "../controllers/users.controller";

const router = Router();

// All organizer routes require authentication
router.use(authenticate);

// GET /organizers/:id/summary
router.get("/:id/summary", usersController.getOrganizerSummary);

// GET /organizers/:id/events
router.get("/:id/events", requireRole("organizer", "admin"), eventsController.getOrganizerEvents);

// GET /organizers/:id/feedback
router.get("/:id/feedback", requireRole("organizer", "admin"), feedbackController.getOrganizerFeedback);

// GET /organizers/:id/payments
router.get("/:id/payments", requireRole("organizer", "admin"), paymentsController.getOrganizerPayments);

export default router;
