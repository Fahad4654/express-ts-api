import { Request, Response } from "express";
import {
  findAllBalances,
  findBalanceByAccountId,
  createBalance,
  deleteBalanceByAccountId,
  updateBalanceByAccountId,
  updateBalancePendingService,
  finalizeTransaction,
  findBalanceById,
} from "../services/balance.service";
import { findUserById } from "../services/user.service";

export async function getBalance(req: Request, res: Response) {
  try {
    if (!req.body) {
      console.log("Request body is required");
      res.status(400).json({ error: "Request body is required" });
      return;
    }
    const { order, asc } = req.body;
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

    const balanceList = await findAllBalances(order, asc);
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
}

export async function getBalanceByAccountId(req: Request, res: Response) {
  try {
    const accountId = req.params.accountId;
    if (!accountId) {
      console.log("Account ID is required");
      res.status(400).json({ error: "Account ID is required" });
      return;
    }

    const foundBalance = await findBalanceByAccountId(accountId);
    if (!foundBalance) {
      console.log("Balance not found");
      res.status(404).json({ error: "Balance not found" });
      return;
    }

    console.log("Balance found", foundBalance);
    res.status(200).json({ status: 200, balance: foundBalance });
    return;
  } catch (error) {
    console.error("Error finding balance:", error);
    res.status(500).json({
      status: 500,
      message: error instanceof Error ? error.message : error,
    });
  }
}

export async function getBalanceById(req: Request, res: Response) {
  try {
    const id = req.params.id;
    if (!id) {
      console.log("Balance ID is required");
      res.status(400).json({ error: "Balance ID is required" });
      return;
    }

    const foundBalance = await findBalanceById(id);
    if (!foundBalance) {
      console.log("Balance not found");
      res.status(404).json({ error: "Balance not found" });
      return;
    }

    console.log("Balance found", foundBalance);
    res.status(200).json({ status: 200, balance: foundBalance });
    return;
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
      console.log("Request body is required");
      res.status(400).json({ error: "Request body is required" });
      return;
    }
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
}

export const deleteBalanceController = async (req: Request, res: Response) => {
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
    if (!req.body.userId) {
      console.log("User Id is required");
      res.status(400).json({ error: "User Id is required" });
      return;
    }

    const foundUser = await findUserById(req.body.userId);

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
};

export async function updateBalanceController(req: Request, res: Response) {
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
}

export async function updateBalancePending(req: Request, res: Response) {
  try {
    const { balanceId, amount, direction } = req.body;
    if (!req.body) {
      console.log("Request body is required");
      res.status(400).json({ error: "Request body is required" });
      return;
    }
    if (!balanceId) {
      console.log("BalanceId is required");
      res.status(400).json({ error: "BalanceId is required" });
      return;
    }
    if (!amount) {
      console.log("Amount is required");
      res.status(400).json({ error: "Amount is required" });
      return;
    }

    if (!direction) {
      console.log("Direction is required");
      res.status(400).json({ error: "Direction is required" });
      return;
    }
    const numericAmount = parseInt(amount, 10);

    if (isNaN(numericAmount)) {
      console.log("Amount should be a valid number");
      res.status(400).json({
        error: "Amount should be a valid number",
      });
      return;
    }

    if (numericAmount < 100) {
      console.log("Amount should be a number equal or more than 100");
      res.status(400).json({
        error: "Amount should be a number equal or more than 100",
      });
      return;
    }

    if (numericAmount > 50000) {
      console.log("Amount should be a number equal or less than 50000");
      res.status(400).json({
        error: "Amount should be a number equal or less than 50000",
      });
      return;
    }
    await updateBalancePendingService(balanceId, amount, direction);
    const updatedBalance = await findBalanceById(balanceId);
    console.log(updatedBalance);
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
}

export async function finalizeTransactionController(
  req: Request,
  res: Response
) {
  try {
    const { balanceId, direction } = req.body;
    if (!req.body) {
      console.log("Request body is required");
      res.status(400).json({ error: "Request body is required" });
      return;
    }
    if (!balanceId) {
      console.log("BalanceId is required");
      res.status(400).json({ error: "BalanceId is required" });
      return;
    }

    if (!direction) {
      console.log("Direction is required");
      res.status(400).json({ error: "Direction is required" });
      return;
    }

    await finalizeTransaction(balanceId, direction);
    const updatedBalance = await findBalanceById(balanceId);
    console.log(updatedBalance);
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
}
