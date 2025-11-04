import { Router } from "express";
import {
  getBalanceController,
  createBalanceController,
  updateBalanceController,
  deleteBalanceController,
  finalizeTransactionController,
} from "../controllers/balance.controller";
import { confirmTransferController } from "../controllers/agetSendBalance.controller";

const router = Router();

router.post("/all", getBalanceController);
router.post("/", createBalanceController);
router.put("/", updateBalanceController);
router.put("/final", finalizeTransactionController);
router.put("/confirm-transfer", confirmTransferController);

router.delete("/", deleteBalanceController);

export { router as balanceRouter };
export { router };
