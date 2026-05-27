import { Request, Response } from "express";
import { certificatesService } from "../services/certificates.service";

export const certificatesController = {
  async issue(req: Request, res: Response) {
    const { eventId, userId, role, certificateUrl } = req.body;
    try {
      const cert = await certificatesService.issueCertificate({ eventId, userId, role, certificateUrl });
      res.status(201).json(cert);
    } catch (err: any) {
      if (err.code === 11000) {
        res.status(400).json({ error: "Certificate already issued for this user and event" });
        return;
      }
      res.status(500).json({ error: err.message });
    }
  },

  async getMyCertificates(req: Request, res: Response) {
    try {
      const certs = await certificatesService.getUserCertificates(req.user!.userId);
      res.json(certs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getEventCertificates(req: Request, res: Response) {
    try {
      const certs = await certificatesService.getEventCertificates(req.params.eventId);
      res.json(certs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },
};
