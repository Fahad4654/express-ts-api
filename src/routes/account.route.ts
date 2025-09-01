import { Router } from "express";
import {
  getAccountsController,
  createAccountController,
  updateAccountController,
  deleteAccountController,
} from "../controllers/account.controller";

const router = Router();

router.get("/", getAccountsController);
router.post("/", createAccountController);
router.put("/", updateAccountController);
router.delete("/", deleteAccountController);

export { router as accountRouter };
export { router };
