import { Router } from "express";
import {
  getBalanceController,
  createBalanceController,
  updateBalanceController,
  deleteBalanceController,
  finalizeTransactionController,
} from "../controllers/balance.controller";

const router = Router();

router.post("/all", getBalanceController);
router.post("/", createBalanceController);
router.put("/", updateBalanceController);
router.put("/final", finalizeTransactionController);

router.delete("/", deleteBalanceController);

export { router as balanceRouter };
export { router };
