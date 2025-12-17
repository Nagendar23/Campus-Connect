    import { Router } from "express";
import { eventsController } from "../controllers/events.controller";
import { authenticate, requireRole, optionalAuth } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { z } from "zod";

const router = Router();

// Validation schemas
const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    coverImage: z.string().optional(),
    category: z.string().optional(),
    location: z.string().min(1),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    capacity: z.number().min(1),
    isPaid: z.boolean().optional(),
    price: z.number().min(0).optional(),
    venue: z.string().optional(),
    status: z.enum(["draft", "published", "archived"]).optional(),
  }),
});

router.get("/", optionalAuth, eventsController.listEvents);
router.get("/:id", optionalAuth, eventsController.getEventById);
router.post("/", authenticate, requireRole("organizer", "admin"), validate(createEventSchema), eventsController.createEvent);
router.patch("/:id", authenticate, requireRole("organizer", "admin"), eventsController.updateEvent);
router.delete("/:id", authenticate, requireRole("organizer", "admin"), eventsController.deleteEvent);

// Import additional controllers for nested routes
import { registrationsController } from "../controllers/registrations.controller";
import { feedbackController } from "../controllers/feedback.controller";

// Registration routes under /events/:id/
router.post("/:id/register", authenticate, registrationsController.registerForEvent);
router.get("/:id/registrations", authenticate, requireRole("organizer", "admin"), registrationsController.getEventRegistrations);

// Feedback routes under /events/:id/
router.post("/:id/feedback", authenticate, feedbackController.submitFeedback);
router.get("/:id/feedback", optionalAuth, feedbackController.getEventFeedback);

export default router;
