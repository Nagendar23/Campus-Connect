import { Router } from "express";
import { usersController } from "../controllers/users.controller";
import { authenticate, requireRole } from "../middlewares/auth";
import { registrationsController } from "../controllers/registrations.controller";

const router = Router();

// Must come before /:id to avoid route conflicts
router.get("/me/registrations", authenticate, registrationsController.getUserRegistrations);

router.get("/:id", authenticate, usersController.getUserById);
router.patch("/:id", authenticate, usersController.updateUser);
router.get("/organizers/:id/summary", authenticate, usersController.getOrganizerSummary);

export default router;
