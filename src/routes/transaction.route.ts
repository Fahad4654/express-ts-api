import { Router } from "express";
import {
  getTransactionController,
  createTransactionController,
  deleteTransactionController,
  updateTransactionController,
} from "../controllers/transaction.controller";
import { transferBalanceTranscationCreationController } from "../controllers/agetSendBalance.controller";

const router = Router();

// Generic routes after
router.post("/all", getTransactionController);
router.post("/", createTransactionController);
router.put("/", updateTransactionController);
router.delete("/", deleteTransactionController);
router.post("/transfer-balance-creation", transferBalanceTranscationCreationController);

export { router as transactionRouter };
export { router };
