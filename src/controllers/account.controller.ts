import { Request, Response } from "express";
import * as accountService from "../services/account.service";

export async function getAccountsController(req: Request, res: Response) {
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

    const userAccounts = await accountService.getAccounts(order, asc);
    console.log("User's Accounts fetched successfully", userAccounts);
    res.status(201).json({
      message: "User's Accounts fetched successfully",
      accout: userAccounts,
      status: "success",
    });
    return;
  } catch (error) {
    console.error("Error fetching user's accounts:", error);
    res.status(500).json({ message: "Error fetching user's accounts", error });
  }
}

export async function createAccountController(req: Request, res: Response) {
  try {
    if (!req.body) {
      console.log("Request body is required");
      res.status(400).json({ error: "Request body is required" });
      return;
    }
    const { userId, currency } = req.body;

    const newUserAccount = await accountService.createAccount(userId, currency);
    console.log("User's Account created successfully", newUserAccount);
    res.status(201).json({
      message: "User's Account created successfully",
      account: newUserAccount,
      status: "success",
    });
    return;
  } catch (error) {
    console.error("Error creating user's account:", error);
    res.status(500).json({ message: "Error creating user's account", error });
  }
}

export async function deleteAccountController(req: Request, res: Response) {
  try {
    if (!req.body) {
      console.log("Request body is required");
      res.status(400).json({ error: "Request body is required" });
      return;
    }
    const { userId } = req.body;
    if (!userId) {
      console.log("User Id is required");
      res.status(400).json({ error: "User Id is required" });
      return;
    }

    const { deletedCount, foundUser } =
      await accountService.deleteAccountByUserId(userId);

    if (deletedCount === 0) {
      console.log(`User: ${foundUser?.name} doesn't have an Account`);
      res.status(404).json({
        error: "User's Account not found",
        message: `User: ${foundUser?.name} doesn't have an Account`,
      });
      return;
    }

    console.log(`User: ${foundUser?.name}'s Account is being Deleted`);
    res.status(200).json({
      message: `User: ${foundUser?.name}'s Account is being Deleted`,
      email: foundUser?.email,
    });
    return;
  } catch (error) {
    console.error("Error deleting user's account:", error);
    res.status(500).json({ message: "Error deleting user's account", error });
  }
}

export async function updateAccountController(req: Request, res: Response) {
  try {
    if (!req.body) {
      console.log("Request body is required");
      res.status(400).json({ error: "Request body is required" });
      return;
    }
    const { userId } = req.body;
    if (!userId) {
      console.log("User Id is required");
      res.status(400).json({ error: "User Id is required" });
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
      console.log("No valid fields provided for update");
      res.status(400).json({ error: "No valid fields provided for update" });
      return;
    }

    const updatedAccount = await accountService.updateAccountByUserId(
      userId,
      updates
    );
    if (!updatedAccount) {
      console.log("Account not found");
      res.status(404).json({ error: "Account not found" });
      return;
    }

    console.log("Account updated successfully", updatedAccount);
    res.status(200).json({
      message: "Account updated successfully",
      account: updatedAccount,
      status: "success",
    });
    return;
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({ message: "Error updating account", error });
  }
}
