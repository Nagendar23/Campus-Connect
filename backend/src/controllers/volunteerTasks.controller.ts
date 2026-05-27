import { Request, Response } from "express";
import { volunteerTasksService } from "../services/volunteerTasks.service";

export const volunteerTasksController = {
  async list(req: Request, res: Response) {
    const { eventId, assignedTo, status } = req.query;
    const filter: any = {};
    if (eventId) filter.eventId = eventId;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (status) filter.status = status;
    const items = await volunteerTasksService.list(filter);
    res.json({ data: items });
  },

  async create(req: Request, res: Response) {
    const payload = req.body;
    const item = await volunteerTasksService.create(payload);
    res.status(201).json({ data: item });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const update = req.body;
    const item = await volunteerTasksService.update(id, update);
    res.json({ data: item });
  },

  async remove(req: Request, res: Response) {
    const { id } = req.params;
    await volunteerTasksService.remove(id);
    res.status(204).send();
  },
};
