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
router.get("/account", findController(Account));
router.get("/balance", findController(Balance));
router.get("/transaction", findController(BalanceTransaction));
router.get("/content", findController(Contents));
router.get("/game", findController(Game));
router.get("/game-history", findController(GameHistory));
router.get("/profile", findController(Profile));
router.get("/user", findController(User));

export { router as findRouter };
export { router };
