import { Router } from "express";
import { volunteerAssignmentsController } from "../controllers/volunteerAssignments.controller";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.get(
	"/",
	authenticate,
	requireRole("volunteer", "organizer", "admin"),
	volunteerAssignmentsController.list
);
router.get(
	"/:id",
	authenticate,
	requireRole("volunteer", "organizer", "admin"),
	volunteerAssignmentsController.getById
);

router.post(
	"/",
	authenticate,
	requireRole("organizer", "admin"),
	volunteerAssignmentsController.create
);
router.patch(
	"/:id",
	authenticate,
	requireRole("organizer", "admin"),
	volunteerAssignmentsController.update
);
router.delete(
	"/:id",
	authenticate,
	requireRole("organizer", "admin"),
	volunteerAssignmentsController.remove
);

export default router;
