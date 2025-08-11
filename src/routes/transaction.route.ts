import { Router } from "express";
import {
  getTransaction,
  getTransactionsByID,
  createTransactionController,
  deleteTransaction,
  updateTransaction,
} from "../controllers/transaction.controller";

const router = Router();

// More specific route first
router.get("/user/:userId", getTransactionsByID);

// Generic routes after
router.get("/", getTransaction);
router.get("/:id", getTransactionsByID);

router.post("/", createTransactionController);
router.put("/", updateTransaction);
router.delete("/", deleteTransaction);

export { router as transactionRouter };
export { router };
