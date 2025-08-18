import { Router } from "express";
import { GameHistory } from "../models/GameHistory";
import { findController } from "../controllers/find.controller";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { User } from "../models/User";
import { Account } from "../models/Account";
import { Balance } from "../models/Balance";
import { Contents } from "../models/Contents";
import { Game } from "../models/Game";
import { Profile } from "../models/Profile";

const router = Router();

// Single record (default)
router.post("/account", findController(Account));
router.post("/balance", findController(Balance));
router.post("/transaction", findController(BalanceTransaction));
router.post("/content", findController(Contents));
router.post("/game", findController(Game));
router.post("/game-history", findController(GameHistory));
router.post("/profile", findController(Profile));
router.post("/user", findController(User));

export { router as findRouter };
export { router };
