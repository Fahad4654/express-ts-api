import { Router } from "express";
import {
  getGameController,
  getGameHistoryController,
  createGameController,
  createGameHistoryController,
  deleteGameController,
  deleteGameHistoryController,
  updateGameController,
  updateGameHistoryController,
} from "../controllers/game.controller";

const router = Router();

// Generic routes after
router.post("/all", getGameController);
router.post("/", createGameController);
router.put("/", updateGameController);
router.delete("/", deleteGameController);

router.post("/history/all", getGameHistoryController);
router.post("/history", createGameHistoryController);
router.put("/history", updateGameHistoryController);
router.delete("/history", deleteGameHistoryController);

export { router as gameRouter };
export { router };
