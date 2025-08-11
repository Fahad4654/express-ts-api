import { Request, Response } from "express";
import {
  findAllTransactions,
  findTransactionById,
  findTransactionsByUserId,
  createTransaction,
  deleteTransactionByIdOrUserId,
  updateTransactionById,
} from "../services/transaction.service";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { User } from "../models/User";
import { Account } from "../models/Account";

export const getTransaction = async (req: Request, res: Response) => {
  try {
    const order = req.body.order;
    const asc = req.body.asc;

    if (!order) {
      res.status(400).json({ error: "Field to sort is required" });
      return;
    }
    if (!asc) {
      res.status(400).json({ error: "Order direction is required" });
      return;
    }

    const transactions = await findAllTransactions(order, asc);

    res.status(200).json({
      message: "Transaction list fetched successfully",
      transactions,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching Transaction list:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

export async function getTransactionsByID(req: Request, res: Response) {
  try {
    const { id, userId } = req.params;

    if (!id && !userId) {
      res
        .status(400)
        .json({ error: "Either transaction ID or userId is required" });
      return;
    }

    let result;

    if (id) {
      result = await BalanceTransaction.findOne({
        where: { id },
        include: [
          {
            model: User,
            attributes: ["id", "name", "email", "phoneNumber"],
          },
          {
            model: Account,
            attributes: ["id", "accountNumber", "status"],
          },
        ],
        nest: true,
        raw: true,
      });

      if (!result) {
        res.status(404).json({
          status: 404,
          message: `Transaction with ID ${id} not found`,
        });
        return;
      }
    } else {
      result = await BalanceTransaction.findAll({
        where: { userId },
        include: [
          {
            model: User,
            attributes: ["id", "name", "email", "phoneNumber"],
          },
          {
            model: Account,
            attributes: ["id", "accountNumber", "status"],
          },
        ],
        nest: true,
        raw: true,
        order: [
          [
            `${req.query.order ? String(req.query.order) : "id"}`,
            `${req.query.asc ? String(req.query.asc) : "ASC"}`,
          ],
        ],
      });

      if (!result.length) {
        res.status(404).json({
          status: 404,
          message: `No transactions found for userId ${userId}`,
        });
        return;
      }
    }

    res.status(200).json({ status: 200, data: result });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
}

export async function createTransactionController(req: Request, res: Response) {
  try {
    const newTransaction = await createTransaction(req.body);
    res.status(201).json({
      message: "Transaction created successfully",
      transaction: newTransaction,
      status: "success",
    });
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    res.status(500).json({
      status: 500,
      message: error.message || String(error),
    });
  }
}

export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.body;

    if (!id && !userId) {
      res.status(400).json({ error: "id or userId is required" });
      return;
    }
    if (id && userId) {
      res.status(400).json({ error: "Provide only id OR userId" });
      return;
    }

    const whereClause = id ? { id } : { userId };

    const foundTransaction = await BalanceTransaction.findOne({
      where: whereClause,
    });
    if (!foundTransaction) {
      res.status(404).json({
        error: id
          ? `Transaction with id ${id} not found`
          : `No transactions found for user ${userId}`,
      });
      return;
    }

    await BalanceTransaction.destroy({ where: whereClause });

    res.status(200).json({
      message: id
        ? `Transaction ${id} deleted successfully`
        : `All transactions for user ${userId} deleted successfully`,
    });
  } catch (error: any) {
    console.error("Error deleting transaction:", error);
    res
      .status(500)
      .json({ status: 500, message: error.message || "Internal server error" });
  }
};

export async function updateTransaction(req: Request, res: Response) {
  try {
    const id = req.body.id;
    if (!id) {
      res.status(400).json({ error: "Id is required" });
      return;
    }

    const updatedTransaction = await updateTransactionById(id, req.body);

    res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedTransaction,
      status: "success",
    });
  } catch (error: any) {
    console.error("Error updating Transaction:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Failed to update Transaction",
    });
  }
}
