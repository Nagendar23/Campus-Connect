import { Router } from "express";
import { volunteerApplicationsController } from "../controllers/volunteerApplications.controller";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get(
	"/",
	authenticate,
	requireRole("volunteer", "organizer", "admin"),
	volunteerApplicationsController.list
);
router.get(
	"/:id",
	authenticate,
	requireRole("volunteer", "organizer", "admin"),
	volunteerApplicationsController.getById
);

router.post(
	"/",
	authenticate,
	requireRole("volunteer", "admin"),
	volunteerApplicationsController.create
);
router.patch(
	"/:id",
	authenticate,
	requireRole("volunteer", "organizer", "admin"),
	volunteerApplicationsController.update
);
router.delete(
	"/:id",
	authenticate,
	requireRole("volunteer", "organizer", "admin"),
	volunteerApplicationsController.remove
);

export default router;
