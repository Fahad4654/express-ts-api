import { Router } from "express";
import {
  faStartController,
  faPickController,
  faCashoutController,
} from "../controllers/games/fortuneApple.controller";

const router = Router();
router.post("/start", faStartController);
router.post("/pick", faPickController);
router.post("/cashout", faCashoutController);

export { router as fortuneAppleRouter };
export { router };
