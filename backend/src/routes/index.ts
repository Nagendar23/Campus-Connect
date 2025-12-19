import { Router } from "express";
import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";
import eventsRoutes from "./events.routes";
import ticketsRoutes from "./tickets.routes";
import checkinRoutes from "./checkin.routes";
import paymentsRoutes from "./payments.routes";
import analyticsRoutes from "./analytics.routes";
import organizersRoutes from "./organizers.routes";
import registrationsRoutes from "./registrations.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/events", eventsRoutes);
router.use("/tickets", ticketsRoutes);
router.use("/checkin", checkinRoutes);
router.use("/payments", paymentsRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/organizers", organizersRoutes);
router.use("/registrations", registrationsRoutes);

export default router;
