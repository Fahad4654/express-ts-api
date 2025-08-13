import { Request, Response } from "express";
import {
  findAllTransactions,
  findTransactionById,
  findTransactionsByUserId,
  createNewTransaction,
  deleteTransactionByIdOrUserId,
  updateTransactionById,
} from "../services/transaction.service";

// GET ALL
export const getTransaction = async (req: Request, res: Response) => {
  try {
    const { order, asc } = req.body;
    if (!req.body) {
      console.log("Request body is required");
      res.status(400).json({ error: "Request body is required" });
      return;
    }
    if (!order) {
      console.log("Field to sort is required");
      res.status(400).json({ error: "Field to sort is required" });
      return;
    }
    if (!asc) {
      console.log("Order direction is required");
      res.status(400).json({ error: "Order direction is required" });
      return;
    }

    const transactions = await findAllTransactions(order, asc);
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
};

// GET BY ID / USER ID
export const getTransactionsByID = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    if (!id && !userId) {
      console.log("Either transaction ID or userId is required");
      res
        .status(400)
        .json({ error: "Either transaction ID or userId is required" });
      return;
    }
    const result = id
      ? await findTransactionById(id)
      : await findTransactionsByUserId(
          userId!,
          String(req.query.order || "id"),
          String(req.query.asc || "ASC")
        );

    if (!result || (Array.isArray(result) && !result.length)) {
      console.log("Transaction(s) not found");
      res.status(404).json({ error: "Transaction(s) not found" });
      return;
    }

    console.log("Transction fetched successfully", result);
    res.status(200).json({ status: 200, transactions: result });
    return;
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({ status: 500, message: String(error) });
  }
};

// CREATE
export const createTransaction = async (req: Request, res: Response) => {
  try {
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
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.body;
    if (!id && !userId) {
      console.log("Id or userId is required");
      res.status(400).json({ error: "Id or userId is required" });
      return;
    }
    if (id && userId) {
      console.log("Provide only id OR userId");
      res.status(400).json({ error: "Provide only id OR userId" });
      return;
    }
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
};

// UPDATE
export const updateTransaction = async (req: Request, res: Response) => {
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
};
