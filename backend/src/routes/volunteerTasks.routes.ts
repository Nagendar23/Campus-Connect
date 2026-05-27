import { Router } from "express";
import { volunteerTasksController } from "../controllers/volunteerTasks.controller";

const router = Router();

router.get("/", volunteerTasksController.list);
router.post("/", volunteerTasksController.create);
router.patch("/:id", volunteerTasksController.update);
router.delete("/:id", volunteerTasksController.remove);

export default router;
