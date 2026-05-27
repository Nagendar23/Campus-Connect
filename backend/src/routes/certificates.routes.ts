import { Router } from "express";
import { certificatesController } from "../controllers/certificates.controller";
import { authenticate, requireRole } from "../middlewares/auth";

const router = Router();

router.post("/issue", authenticate, requireRole("organizer", "admin"), certificatesController.issue);
router.get("/me", authenticate, certificatesController.getMyCertificates);
router.get("/event/:eventId", authenticate, requireRole("organizer", "admin"), certificatesController.getEventCertificates);

export default router;
