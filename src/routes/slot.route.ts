import { Router } from "express";
import { spinSlotController } from "../controllers/games/slot.controller";

const router = Router();

router.post("/spin", spinSlotController);

export { router as slotRouter };
export { router };
