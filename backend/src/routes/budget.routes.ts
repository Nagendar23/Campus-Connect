import { Router } from "express";
import { budgetController } from "../controllers/budget.controller";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.use(authenticate, requireRole("organizer", "admin"));

router.post("/transaction", budgetController.addTransaction);
router.get("/event/:eventId", budgetController.getEventBudget);
router.get("/me", budgetController.getMyBudget);

export default router;
