import { Router } from "express";
import { ticketsController } from "../controllers/tickets.controller";
import { authenticate } from "../middlewares/auth";

const router = Router();

router.get("/:id", authenticate, ticketsController.getTicketById);
router.get("/:id/qrcode", authenticate, ticketsController.getTicketQRCode);

export default router;
