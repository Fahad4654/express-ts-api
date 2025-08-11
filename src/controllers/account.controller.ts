import { Request, Response } from "express";
import * as accountService from "../services/account.service";

export async function getAccounts(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    const { order, asc } = req.body;
    if (!order) {
      res.status(400).json({ error: "Field to sort is required" });
      return;
    }
    if (!asc) {
      res.status(400).json({ error: "Order direction is required" });
      return;
    }

    const userAccounts = await accountService.getAccounts(order, asc);
    res.status(201).json({
      message: "User's Accounts fetching successfully",
      userAccounts,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching user's accounts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getAccountById(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    if (!userId) {
      res.status(400).json({
        status: 400,
        error: "User ID is required as a route parameter (e.g., /account/:userId)",
      });
      return;
    }

    const foundUserAccount = await accountService.getAccountByUserId(userId);
    if (!foundUserAccount) {
      res.status(404).json({
        status: 404,
        message: "User's Account not found",
      });
      return;
    }

    res.status(200).json({ status: 200, data: foundUserAccount });
  } catch (error) {
    console.error("Error finding user's account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createAccount(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    const { userId, currency } = req.body;

    const newUserAccount = await accountService.createAccount(userId, currency);
    res.status(201).json({
      message: "User's Account created successfully",
      user: newUserAccount,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating user's account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteAccount(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: "UserId is required" });
      return;
    }

    const { deletedCount, foundUser } = await accountService.deleteAccountByUserId(userId);

    if (deletedCount === 0) {
      res.status(404).json({
        error: "User's Account not found",
        message: `User: ${foundUser?.name} doesn't have an Account`,
      });
      return;
    }

    res.status(200).json({
      message: `User: ${foundUser?.name}'s Account is being Deleted`,
      email: foundUser?.email,
    });
  } catch (error) {
    console.error("Error deleting user's account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateAccount(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    const { userId } = req.body;
    if (!userId) {
      res.status(400).json({ error: "UserId is required" });
      return;
    }

    const allowedFields: string[] = ["status", "currency", "accountType"];
    const updates: Partial<typeof req.body> = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields provided for update" });
      return;
    }

    const updatedAccount = await accountService.updateAccountByUserId(userId, updates);
    if (!updatedAccount) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    res.status(200).json({
      message: "Account updated successfully",
      account: updatedAccount,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
