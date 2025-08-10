import { Balance } from "../models/Balance";
import { Request, RequestHandler, Response } from "express";
import { Account } from "../models/Account";
import { sequelize } from "../config/database";
import { User } from "../models/User";

//All User Balanace
export const getBalance: RequestHandler = async (req, res) => {
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

    const balanceList = await Balance.findAll({
      include: [
        {
          model: Account,
          // Optionally exclude account fields if needed
          attributes: ["id", "userId", "accountNumber"],
        },
      ],
      nest: true, // Preserves nested structure
      raw: true, // Returns plain objects
      order: [
        [
          `${req.body.order ? req.body.order : "createdAt"}`,
          `${req.body.asc ? req.body.asc : "ASC"}`,
        ],
      ], //{'property':'ASC/DESC'}}
    });
    console.log("Balanace list:", balanceList);
    res.status(201).json({
      message: "Balance List fetching successfully",
      usersBalances: balanceList,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching balance list:", error);
    res.status(500).json(error);
  }
};

//get User Balance by Account ID
export async function getBalanceByAccountId(req: Request, res: Response) {
  try {
    // Better: Use route parameter instead of body for GET requests
    const accountId = req.params.accountId; // Change to req.query.id if using query params

    if (!accountId) {
      res.status(400).json({
        status: 400,
        error:
          "account ID is required as a route parameter (e.g., /balance/:accountId)",
      });
      return;
    }

    const foundBalance = await Balance.findOne({
      where: { accountId },
      include: [
        {
          model: Account,
          attributes: ["id", "userId", "accountNumber"],
        },
      ],
      nest: true, // Preserves nested structure
      raw: true, // Returns plain objects
    });

    if (!foundBalance) {
      res.status(404).json({
        status: 404,
        message: "Balance not found",
      });
      return;
    }

    console.log("Balance found:", foundBalance);
    res.status(200).json({
      status: 200,
      data: foundBalance,
    });
    return;
  } catch (error) {
    console.error("Error finding balance:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
    return;
  }
}

//Create Balance
export async function createBalance(req: Request, res: Response) {
  console.log(req.body);
  const { accountId, availableBalance, pendingBalance, holdBalance, currency } =
    req.body;
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    const newBalance = await Balance.create({
      accountId,
      availableBalance,
      pendingBalance,
      holdBalance,
      currency,
    });

    res.status(201).json({
      message: "Balance created successfully",
      user: newBalance,
      status: "success",
    });
  } catch (error: any) {
    console.error("Error creating balance:", error);
    res.status(500).json({ status: 500, message: error });
  }
}

//Delete balance
export const deleteBalance: RequestHandler = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    if (!req.body.accountId) {
      res.status(400).json({ error: "accountId is required" });
      console.log(req.body.accountId);
      return;
    }

    const foundUser = await User.findOne({
          where: { id: req.body.userId },
          attributes: [ "name", "email"],
        });

    const deletedCount = await Balance.destroy({
      where: { accountId: req.body.accountId },
    });

    if (deletedCount === 0) {
      res.status(404).json({
        error: "User's Balance not found",
        message: `User: ${foundUser?.name} doesn't have a Balance`,
      });
      console.log("User's Balance not found: ", foundUser?.email);
      return;
    }

    console.log("User's Balance found: ", foundUser?.name);
    res.status(200).json({
      message: `User: ${foundUser?.name}'s Balance is being Deleted`,
      email: foundUser?.email,
    });
  } catch (error) {
    console.error("Error deleting user balances:", error);
    res.status(500).json({ status: 500, message: error });
  }
};

//Update Balance
export async function updateBalance(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      console.log("request body is required");
      return;
    }

    const { accountId } = req.body;
    if (!accountId) {
      res.status(400).json({ error: "accountId is required" });
      console.log("accountId is required");
      return;
    }

    const allowedFields: Array<keyof Balance> = [
      "availableBalance",
      "pendingBalance",
      "holdBalance",
      "currency",
      "lastTransactionAt",
    ];

    const updates: Partial<Balance> = {};

    // Start a transaction for safe update
    await sequelize.transaction(async (t) => {
      // Lock the row for update
      const balance = await Balance.findOne({
        where: { accountId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!balance) {
        res.status(404).json({ error: "Balance not found" });
        console.log("Balance not found");
        throw new Error("Abort transaction");
      }

      // Validate and parse updates
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          if (
            ["availableBalance", "pendingBalance", "holdBalance"].includes(key)
          ) {
            const numVal = Number(req.body[key]);
            if (isNaN(numVal)) {
              throw new Error(`${key} must be a number`);
            }
            updates[key] = numVal as any;
          } else if (key === "lastTransactionAt") {
            const dateVal = new Date(req.body[key]);
            if (isNaN(dateVal.getTime())) {
              throw new Error(`${key} must be a valid date`);
            }
            updates[key] = dateVal as any;
          } else {
            updates[key] = req.body[key];
          }
        }
      }

      if (Object.keys(updates).length === 0) {
        res.status(400).json({ error: "No valid fields provided for update" });
        console.log("No valid fields provided for update");
        throw new Error("Abort transaction");
      }

      await balance.update(updates, { transaction: t });

      res.status(200).json({
        message: "Balance updated successfully",
        balance,
        status: "success",
      });

      console.log("Balance updated successfully, balance:", balance);
    });
  } catch (error) {
    console.error("Error updating Balance:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update Balance",
      error: error instanceof Error ? error.message : error,
    });
  }
}
