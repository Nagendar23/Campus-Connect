import { Router } from "express";
import { sponsorOpportunitiesController } from "../controllers/sponsorOpportunities.controller";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get(
	"/",
	authenticate,
	requireRole("sponsor", "organizer", "admin"),
	sponsorOpportunitiesController.list
);
router.get(
	"/:id",
	authenticate,
	requireRole("sponsor", "organizer", "admin"),
	sponsorOpportunitiesController.getById
);

router.post(
	"/",
	authenticate,
	requireRole("organizer", "admin"),
	sponsorOpportunitiesController.create
);
router.patch(
	"/:id",
	authenticate,
	requireRole("organizer", "admin"),
	sponsorOpportunitiesController.update
);
router.delete(
	"/:id",
	authenticate,
	requireRole("organizer", "admin"),
	sponsorOpportunitiesController.remove
);

export default router;
