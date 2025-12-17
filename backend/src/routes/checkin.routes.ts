import { Router } from "express";
import { checkinController } from "../controllers/checkin.controller";
import { authenticate, requireRole } from "../middlewares/auth";
import { checkinLimiter } from "../middlewares/rateLimit";
import { validate } from "../middlewares/validate";
import { z } from "zod";

const router = Router();

const scanSchema = z.object({
  body: z.object({
    token: z.string(),
  }),
});

router.post("/scan", authenticate, requireRole("organizer", "admin"), checkinLimiter, validate(scanSchema), checkinController.scanQRCode);
router.get("/history", authenticate, requireRole("organizer", "admin"), checkinController.getCheckInHistory);

export default router;
