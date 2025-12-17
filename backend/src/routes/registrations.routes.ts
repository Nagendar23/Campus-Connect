import { Router } from "express";
import { registrationsController } from "../controllers/registrations.controller";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

// Student routes
router.post("/events/:id/register", authenticate, registrationsController.registerForEvent);
router.get("/me", authenticate, registrationsController.getUserRegistrations);
router.get("/:id", authenticate, registrationsController.getRegistration);

// Organizer routes
router.get("/events/:id", authenticate, requireRole("organizer", "admin"), registrationsController.getEventRegistrations);

export default router;
