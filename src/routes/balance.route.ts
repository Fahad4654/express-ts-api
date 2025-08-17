import { Router } from "express";
import {
  getBalance,
  getBalanceByAccountId,
  createBalanceController,
  updateBalanceController,
  deleteBalanceController,
  // updateBalancePending,
  finalizeTransactionController,
  getBalanceById,
} from "../controllers/balance.controller";

const router = Router();

router.get("/", getBalance);
router.get("/account/:accountId", getBalanceByAccountId);
router.get("/:id", getBalanceById);
router.post("/", createBalanceController);
router.put("/", updateBalanceController);
// router.put("/pending", updateBalancePending);
router.put("/final", finalizeTransactionController);

router.delete("/", deleteBalanceController);

export { router as balanceRouter };
export { router };
