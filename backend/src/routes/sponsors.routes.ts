import { Router } from "express";
import { sponsorsController } from "../controllers/sponsors.controller";
import { authenticate, optionalAuth, requireRole } from "../middlewares/auth";

const router = Router();

router.get("/", optionalAuth, sponsorsController.list);
router.get("/me", authenticate, requireRole("sponsor", "admin"), sponsorsController.getMe);
router.get("/:id", optionalAuth, sponsorsController.getById);

router.post("/", authenticate, sponsorsController.create);
router.patch("/:id", authenticate, sponsorsController.update);
router.delete("/:id", authenticate, sponsorsController.remove);

export default router;
