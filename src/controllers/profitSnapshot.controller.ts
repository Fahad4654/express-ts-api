// src/controllers/admin.controller.ts
import { Request, Response } from "express";
import { takeProfitSnapshot } from "../services/snapshot.service";
import { isAdmin } from "../middlewares/isAdmin.middleware";

export const AdminController = {
  takeSnapshot: async (req: Request, res: Response) => {
    const adminMiddleware = isAdmin();

    adminMiddleware(req, res, async () => {
      try {
        // TODO: Add proper admin auth check here
        const snapshot = await takeProfitSnapshot();
        res.json({ success: true, snapshot });
      } catch (err: any) {
        res.status(500).json({ success: false, error: err.message });
      }
    });
  },
};
