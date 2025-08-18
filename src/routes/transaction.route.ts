import { Router } from "express";
import {
  getTransaction,
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "../controllers/transaction.controller";

const router = Router();


// Generic routes after
router.get("/", getTransaction);

router.post("/", createTransaction);
router.put("/", updateTransaction);
router.delete("/", deleteTransaction);

export { router as transactionRouter };
export { router };
