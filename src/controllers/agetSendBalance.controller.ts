import { isAdminOrAgent } from "../middlewares/isAgentOrAdmin.middleware";
import { transferBalanceTranscationCreation } from "../services/agetSendBalance.service";
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
