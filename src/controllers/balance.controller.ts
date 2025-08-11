import { Request, Response } from "express";
import {
  findAllBalances,
  findBalanceByAccountId,
  createBalance,
  deleteBalanceByAccountId,
  findUserById,
  updateBalanceByAccountId,
} from "../services/balance.service";

export async function getBalance(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }

    const order = req.body.order || "createdAt";
    const asc = req.body.asc || "ASC";

    const balanceList = await findAllBalances(order, asc);

    res.status(201).json({
      message: "Balance list fetched successfully",
      usersBalances: balanceList,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching balance list:", error);
    res.status(500).json({
      status: 500,
      message: error instanceof Error ? error.message : error,
    });
  }
}

export async function getBalanceByAccountId(req: Request, res: Response) {
  try {
    const accountId = req.params.accountId;
    if (!accountId) {
      res.status(400).json({ error: "account ID is required" });
      return;
    }

    const foundBalance = await findBalanceByAccountId(accountId);
    if (!foundBalance) {
      res.status(404).json({ error: "Balance not found" });
      return;
    }

    res.status(200).json({ status: 200, data: foundBalance });
  } catch (error) {
    console.error("Error finding balance:", error);
    res.status(500).json({
      status: 500,
      message: error instanceof Error ? error.message : error,
    });
  }
}

export async function createBalanceController(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    const newBalance = await createBalance(req.body);
    res.status(201).json({
      message: "Balance created successfully",
      user: newBalance,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating balance:", error);
    res.status(500).json({
      status: 500,
      message: error instanceof Error ? error.message : error,
    });
  }
}

export const deleteBalanceController = async (req: Request, res: Response) => {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    if (!req.body.accountId) {
      res.status(400).json({ error: "accountId is required" });
      return;
    }

    const foundUser = await findUserById(req.body.userId);

    await deleteBalanceByAccountId(req.body.accountId);

    res.status(200).json({
      message: `User: ${foundUser?.name}'s Balance is deleted`,
      email: foundUser?.email,
    });
  } catch (error) {
    console.error("Error deleting user balances:", error);
    res.status(500).json({
      status: 500,
      message: error instanceof Error ? error.message : error,
    });
  }
};

export async function updateBalanceController(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    if (!req.body.accountId) {
      res.status(400).json({ error: "accountId is required" });
      return;
    }

    const updatedBalance = await updateBalanceByAccountId(
      req.body.accountId,
      req.body
    );

    res.status(200).json({
      message: "Balance updated successfully",
      balance: updatedBalance,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating Balance:", error);
    res.status(500).json({
      status: "error",
      message:
        error instanceof Error ? error.message : "Failed to update Balance",
    });
  }
}
