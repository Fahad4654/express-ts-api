import { Router } from "express";
import {
  getBalance,
  getBalanceByAccountId,
  createBalanceController,
  updateBalanceController,
  deleteBalanceController,
} from "../controllers/balance.controller";

const router = Router();

router.get("/", getBalance);
router.get("/:accountId", getBalanceByAccountId);
router.post("/", createBalanceController);
router.put("/", updateBalanceController);
router.delete("/", deleteBalanceController);

export { router as balanceRouter };
export { router };
