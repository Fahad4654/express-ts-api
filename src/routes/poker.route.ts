import { Router } from "express";
import {
  pokerDealController,
  pokerDrawController,
} from "../controllers/games/poker.controller";

const router = Router();
router.post("/deal", pokerDealController);
router.post("/draw", pokerDrawController);

export { router as pokerRouter };
export { router };
