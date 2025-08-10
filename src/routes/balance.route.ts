import { Router } from "express";
import {
  getBalance,
  getBalanceByAccountId,
  createBalance,
  updateBalance,
  deleteBalance,
} from "../controllers/balance.controller";

const router = Router();

router.get("/", getBalance);
router.get("/:id", getBalanceByAccountId);
router.post("/", createBalance);
router.put("/", updateBalance);
router.delete("/", deleteBalance);

export { router as balanceRouter };
export { router };
