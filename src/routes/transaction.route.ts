import { Router } from "express";
import {
  getTransaction,
  getTransactionsByID,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "../controllers/transaction.controller";

const router = Router();

router.get("/", getTransaction);
router.get("/:id", getTransactionsByID);
router.get("/user/:userId", getTransactionsByID);
router.post("/", createTransaction);
router.put("/", updateTransaction);
router.delete("/", deleteTransaction);

export { router as transactionRouter };
export { router };
