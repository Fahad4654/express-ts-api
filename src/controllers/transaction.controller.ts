import { Request, Response } from "express";
import {
  findAllTransactions,
  createNewTransaction,
  deleteTransactionByIdOrUserId,
  updateTransactionById,
} from "../services/transaction.service";
import { isAdmin } from "../middlewares/isAdmin.middleware";
import { validateRequiredBody } from "../services/reqBodyValidation.service";
import { isAdminOrAgent } from "../middlewares/isAgentOrAdmin.middleware";
import { User } from "../models/User";

// GET ALL
export const getTransactionController = async (req: Request, res: Response) => {
  const agentOrAdminMiddleware = isAdminOrAgent();

  agentOrAdminMiddleware(req, res, async () => {
    try {
      const user = req.user;
      if (!user) {
        console.log("User is required");
        res.status(400).json({ error: "User is required" });
        return;
      }
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
      let where: any = {};

      const { order, asc, page = 1, pageSize = 10 } = req.body;
      if (user.isAgent) {
        const createdUsers = await User.findAll({
          where: { createdBy: user.id },
          attributes: ["id"],
        });

        const userIds = createdUsers.map((u) => u.id);

        if (userIds.length === 0) {
          return res.status(200).json({
            success: true,
            message: "No transactions found for your users.",
            data: [],
          });
        }
        console.log("*****", userIds);
        where = { userId: userIds };
      }

      const transactions = await findAllTransactions(
        order,
        asc,
        page,
        pageSize,
        where
      );

      console.log("Transaction list fetched successfully", transactions);
      res.status(200).json({
        message: "Transaction list fetched successfully",
        transactionlist: transactions,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error fetching Transaction list:", error);
      res.status(500).json({ status: 500, message: String(error) });
    }
  });
};

// CREATE
export const createTransactionController = async (
  req: Request,
  res: Response
) => {
  try {
    const reqBodyValidation = validateRequiredBody(req, res, [
      "userId",
      "accountId",
      "balanceId",
      "type",
      "direction",
      "amount",
      "currency",
      "description",
      "trxId",
      "status",
    ]);
    if (!reqBodyValidation) return;
    if (!req.user) {
      res.status(500).json({
        message: "You must Login first",
      });
      return;
    }
    if (
      !req.user?.isAdmin &&
      !req.user?.isAgent &&
      req.body.userId !== req.user?.id
    ) {
      res.status(500).json({
        message: "Permission Denied",
      });
      return;
    }
    const transaction = await createNewTransaction(req.body);
    res.status(201).json({
      message: "Transaction created successfully",
      transaction,
      status: "success",
    });
    return;
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ status: 500, message: String(error) });
  }
};

// DELETE
export const deleteTransactionController = async (
  req: Request,
  res: Response
) => {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      const reqBodyValidation = validateRequiredBody(req, res, [
        "id",
        "userId",
      ]);
      if (!reqBodyValidation) return;

      const { id, userId } = req.body;
      await deleteTransactionByIdOrUserId(id, userId);
      console.log(
        id
          ? `Transaction ${id} deleted successfully`
          : `All transactions for user ${userId} deleted successfully`
      );
      res.status(200).json({
        message: id
          ? `Transaction ${id} deleted successfully`
          : `All transactions for user ${userId} deleted successfully`,
      });
      return;
    } catch (error) {
      console.error("Error deleting transaction:", error);
      res.status(500).json({ status: 500, message: String(error) });
    }
  });
};

// UPDATE
export const updateTransactionController = async (
  req: Request,
  res: Response
) => {
  const adminMiddleware = isAdmin();

  adminMiddleware(req, res, async () => {
    try {
      const { id } = req.body;
      if (!id) {
        console.log("Id is required");
        res.status(400).json({ error: "Id is required" });
        return;
      }

      const updatedTransaction = await updateTransactionById(id, req.body);
      console.log("Transaction updated successfully", updatedTransaction);
      res.status(200).json({
        message: "Transaction updated successfully",
        transaction: updatedTransaction,
        status: "success",
      });
      return;
    } catch (error) {
      console.error("Error updating Transaction:", error);
      res.status(500).json({ status: 500, message: String(error) });
    }
  });
};
