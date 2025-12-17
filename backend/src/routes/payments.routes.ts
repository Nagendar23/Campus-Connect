import { Router } from "express";
import { paymentsController } from "../controllers/payments.controller";
import { authenticate, requireRole } from "../middlewares/auth";
import { validate } from "../middlewares/validate";
import { z } from "zod";

const router = Router();

const paymentIntentSchema = z.object({
  body: z.object({
    eventId: z.string(),
  }),
});

const confirmPaymentSchema = z.object({
  body: z.object({
    paymentId: z.string(),
    success: z.boolean(),
  }),
});

router.post("/intent", authenticate, validate(paymentIntentSchema), paymentsController.createPaymentIntent);
router.post("/confirm", validate(confirmPaymentSchema), paymentsController.confirmPayment);
router.get("/history", authenticate, paymentsController.getPaymentHistory);
router.get("/organizers/:id", authenticate, requireRole("organizer", "admin"), paymentsController.getOrganizerPayments);

export default router;
