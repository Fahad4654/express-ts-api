import { Router } from "express";
import {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
} from "../controllers/account.controller";

const router = Router();

router.get("/", getAccounts);
router.get("/:userId", getAccountById);
router.post("/", createAccount);
router.put("/", updateAccount);
router.delete("/", deleteAccount);

export { router as accountRouter };
export { router };
