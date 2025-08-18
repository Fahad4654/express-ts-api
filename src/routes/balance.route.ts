import { Router } from "express";
import {
  getBalance,
  createBalanceController,
  updateBalanceController,
  deleteBalanceController,
  finalizeTransactionController,
} from "../controllers/balance.controller";

const router = Router();

router.get("/", getBalance);
router.post("/", createBalanceController);
router.put("/", updateBalanceController);
router.put("/final", finalizeTransactionController);

router.delete("/", deleteBalanceController);

export { router as balanceRouter };
export { router };
