import { Request, Response } from "express";
import {
  findAllBalances,
  createBalance,
  deleteBalanceByAccountId,
  updateBalanceByAccountId,
  finalizeTransaction,
} from "../services/balance.service";
import { findByDynamicId } from "../services/find.service";
import { Balance } from "../models/Balance";
import { User } from "../models/User";
import { isAdmin } from "../middlewares/isAdmin.middleware";
import { validateRequiredBody } from "../services/reqBodyValidation.service";
import { isAdminOrAgent } from "../middlewares/isAgentOrAdmin.middleware";
import { BalanceTransaction } from "../models/BalanceTransaction";

export async function getBalanceController(req: Request, res: Response) {
  const agentOrAdminMiddleware = isAdminOrAgent();

  agentOrAdminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }
      const reqBodyValidation = validateRequiredBody(req, res, [
        "order",
        "asc",
      ]);
      if (!reqBodyValidation) return;
      const { order, asc, page = 1, pageSize = 10 } = req.body;

      const balanceList = await findAllBalances(
        order,
        asc,
        Number(page),
        Number(pageSize)
      );
      console.log("Balance list fetched successfully", balanceList);

      res.status(201).json({
        message: "Balance list fetched successfully",
        balanceList,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error fetching balance list:", error);
      res.status(500).json({
        status: 500,
        message: error instanceof Error ? error.message : error,
      });
    }
  });
}

export async function createBalanceController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }
      const reqBodyValidation = validateRequiredBody(req, res, [
        "accountId",
        "availableBalance",
        "holdBalance",
        "currency",
      ]);
      if (!reqBodyValidation) return;
      const newBalance = await createBalance(req.body);
      console.log("Balance created successfully", newBalance);
      res.status(201).json({
        message: "Balance created successfully",
        balance: newBalance,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error creating balance:", error);
      res.status(500).json({
        status: 500,
        message: error instanceof Error ? error.message : error,
      });
    }
  });
}

export const deleteBalanceController = async (req: Request, res: Response) => {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }
      const reqBodyValidation = validateRequiredBody(req, res, [
        "accountId",
        "userId",
      ]);
      if (!reqBodyValidation) return;

      const foundtypedUser = await findByDynamicId(
        User,
        { id: req.body.userId },
        false
      );
      const foundUser = foundtypedUser as User | null;
      await deleteBalanceByAccountId(req.body.accountId);

      console.log(`User: ${foundUser?.name}'s Balance is deleted`);
      res.status(200).json({
        message: `User: ${foundUser?.name}'s Balance is deleted`,
        email: foundUser?.email,
      });
      return;
    } catch (error) {
      console.error("Error deleting user balances:", error);
      res.status(500).json({
        status: 500,
        message: error instanceof Error ? error.message : error,
      });
    }
  });
};

export async function updateBalanceController(req: Request, res: Response) {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }
      if (!req.body.accountId) {
        console.log("Account Id is required");
        res.status(400).json({ error: "AccountId is required" });
        return;
      }

      const updatedBalance = await updateBalanceByAccountId(
        req.body.accountId,
        req.body
      );

      console.log("Balance updated successfully", updatedBalance);
      res.status(200).json({
        message: "Balance updated successfully",
        balance: updatedBalance,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error updating Balance:", error);
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update Balance",
      });
    }
  });
}

export async function finalizeTransactionController(
  req: Request,
  res: Response
) {
  const agentOrAdminMiddleware = isAdminOrAgent();

  agentOrAdminMiddleware(req, res, async () => {
    try {
      const { balanceId, transactionId } = req.body;

      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }

      if (!req.user) {
        res.status(500).json({
          message: "You must Login first",
        });
        return;
      }

      if (!balanceId) {
        console.log("BalanceId is required");
        res.status(400).json({ error: "BalanceId is required" });
        return;
      }

      if (!transactionId) {
        console.log("Transaction Id required");
        res.status(400).json({ error: "Transaction Id is required" });
        return;
      }

      const transaction = await BalanceTransaction.findOne({
        where: { id: transactionId },
      });
      console.log("ttttttttttt", transaction);
      if (!transaction) {
        console.log("Transaction not found");
        res.status(404).json({ error: "Transaction not found" });
        return;
      }

      const transactionUser = await User.findOne({
        where: { id: transaction.userId },
      });
      console.log(transactionUser);
      if (!transactionUser) {
        console.log("User not found");
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (!req.user.isAdmin && transactionUser.createdBy !== req.user.id) {
        res.status(400).json({ error: "Permission Denied" });
        return;
      }

      const result = await finalizeTransaction(
        balanceId,
        transactionId,
        req.user?.id
      );

      // Handle failed transaction case
      if (result.error) {
        console.log("Transaction failed:", result.error);
        res.status(400).json({
          message: "Transaction failed",
          reason: result.error,
          balance: result.balance,
          transaction: result.transaction,
          status: "failed",
        });
        return;
      }

      const updatedBalance = await findByDynamicId(
        Balance,
        { id: balanceId },
        false
      );
      console.log("Transaction completed:", updatedBalance);

      res.status(200).json({
        message: "Transaction completed successfully",
        balance: updatedBalance,
        transaction: result.transaction,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error finalizing transaction:", error);
      res.status(500).json({
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update Balance",
      });
      return;
    }
  });
}
