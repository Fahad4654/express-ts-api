import { Router } from "express";
import {
  bjDealController,
  bjHitController,
  bjStandController,
} from "../controllers/games/blackjack.controller";

const router = Router();
router.post("/deal", bjDealController);
router.post("/hit", bjHitController);
router.post("/stand", bjStandController);

export { router as blackjackRouter };
export { router };
