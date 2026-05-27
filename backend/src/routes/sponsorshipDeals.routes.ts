import { Router } from "express";
import { sponsorshipDealsController } from "../controllers/sponsorshipDeals.controller";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get(
	"/",
	authenticate,
	requireRole("sponsor", "organizer", "admin"),
	sponsorshipDealsController.list
);
router.get(
	"/:id",
	authenticate,
	requireRole("sponsor", "organizer", "admin"),
	sponsorshipDealsController.getById
);

router.post(
	"/",
	authenticate,
	requireRole("sponsor", "organizer", "admin"),
	sponsorshipDealsController.create
);
router.patch(
	"/:id",
	authenticate,
	requireRole("sponsor", "organizer", "admin"),
	sponsorshipDealsController.update
);
router.delete(
	"/:id",
	authenticate,
	requireRole("sponsor", "organizer", "admin"),
	sponsorshipDealsController.remove
);

export default router;
