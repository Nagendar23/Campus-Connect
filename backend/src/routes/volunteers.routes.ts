import { Router } from "express";
import { volunteersController } from "../controllers/volunteers.controller";
import { authenticate, optionalAuth, requireRole } from "../middlewares/auth";

const router = Router();

// Public list
router.get("/", optionalAuth, volunteersController.list);
router.get("/me", authenticate, requireRole("volunteer", "admin"), volunteersController.getMe);
router.get("/:id", optionalAuth, volunteersController.getById);

// Profile management
router.post("/", authenticate, volunteersController.create);
router.patch("/:id", authenticate, volunteersController.update);
router.delete("/:id", authenticate, volunteersController.remove);

export default router;
