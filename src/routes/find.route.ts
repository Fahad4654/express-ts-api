import { Router } from "express";
import { GameHistory } from "../models/GameHistory";
import { createFindController } from "../controllers/find.controller";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { User } from "../models/User";
import { Account } from "../models/Account";
import { Balance } from "../models/Balance";
import { Contents } from "../models/Contents";
import { Game } from "../models/Game";
import { Profile } from "../models/Profile";

const router = Router();

// Single record (default)
router.post("/account", createFindController(Account));
router.post("/balance", createFindController(Balance));
router.post("/transaction", createFindController(BalanceTransaction));
router.post("/content", createFindController(Contents));
router.post("/game", createFindController(Game));
router.post("/game-history", createFindController(GameHistory));
router.post("/profile", createFindController(Profile));
router.post("/user", createFindController(User));

export { router as findRouter };
export { router };
