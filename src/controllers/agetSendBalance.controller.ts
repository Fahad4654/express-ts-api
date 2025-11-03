import { isAdminOrAgent } from "../middlewares/isAgentOrAdmin.middleware";
import { Balance } from "../models/Balance";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { User } from "../models/User";
import { confirmTransfer, transferBalanceTranscationCreation } from "../services/agetSendBalance.service";
import { findByDynamicId } from "../services/find.service";
import { validateRequiredBody } from "../services/reqBodyValidation.service";
import { Request, Response } from "express";

export async function transferBalanceTranscationCreationController(
  req: Request,
  res: Response
) {
  const agentOrAdminMiddleware = isAdminOrAgent();

  agentOrAdminMiddleware(req, res, async () => {
    try {
      if (!req.body) {
        console.log("Request body is required");
        res.status(400).json({ error: "Request body is required" });
        return;
      }
      const reqBodyValidation = validateRequiredBody(req, res, [
        "accountId",
        "currency",
        "userId",
        "type",
        "direction",
        "amount",
        "trxId",
        "balanceId",
        "createdBy",
      ]);
      if (!reqBodyValidation) return;
      const newBalance = await transferBalanceTranscationCreation(req.body);
      console.log("Balance Transaction created successfully", newBalance);
      res.status(201).json({
        message: "Balance Transaction created successfully",
        balance: newBalance,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error creating Balance Transaction:", error);
      res.status(500).json({
        status: 500,
        message: error instanceof Error ? error.message : error,
      });
    }
  });
}



export async function confirmTransferController(
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

      const result = await confirmTransfer(
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
