// src/routes/admin.routes.ts
import { Router } from "express";
import { AdminController } from "../controllers/profitSnapshot.controller";

const router = Router();

router.post("/", AdminController.takeSnapshot);

export { router as profitSnapshotRouter };
export { router };
