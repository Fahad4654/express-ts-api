import { Router } from "express";
import {
  getGame,
  getGameHistory,
  createGameController,
  createGameHistoryController,
  deleteGameController,
  deleteGameHistoryController,
  updateGame,
  updateGameHistory,
} from "../controllers/game.controller";

const router = Router();

// Generic routes after
router.get("/", getGame);
router.post("/", createGameController);
router.put("/", updateGame);
router.delete("/", deleteGameController);


router.get("/history", getGameHistory);
router.post("/history", createGameHistoryController);
router.put("/history", updateGameHistory);
router.delete("/history", deleteGameHistoryController);

export { router as gameRouter };
export { router };
