import { Balance } from "../models/Balance";
import { Request, RequestHandler, Response } from "express";
import { Account } from "../models/Account";
import { sequelize } from "../config/database";

//User Balanace
export const getBalance: RequestHandler = async (req, res) => {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    const { order, asc } = req.body;
    if (!order) {
      res.status(400).json({ error: "Field is required" });
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
          `${req.body.order ? req.body.order : "id"}`,
          `${req.body.asc ? req.body.asc : "ASC"}`,
        ],
      ], //{'property':'ASC/DESC'}}
    });
    console.log("Balanace list:", balanceList);
    res.status(201).json({
      message: "Balance List fetching successfully",
      userBalances: balanceList,
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
    const accountId = req.params.id; // Change to req.query.id if using query params

    if (!accountId) {
      res.status(400).json({
        status: 400,
        error: "account ID is required as a route parameter (e.g., /users/:id)",
      });
      return;
    }

    const foundBalance = await Balance.findOne({
      where: { accountId: accountId },
      include: [
        {
          model: Account,
          // Optionally exclude profile fields if needed
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

//Create User Account
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

//Delete User Account
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

    const foundBalance = await Balance.findOne({
      where: { id: req.body.accountId },
      attributes: ["id", "accountId"],
    });

    const deletedCount = await Balance.destroy({
      where: { accountId: req.body.accountId },
    });

    if (deletedCount === 0) {
      res.status(404).json({
        error: "User's Account not found",
        message: `User: ${foundBalance?.accountId} doesn't have a Account`,
      });
      console.log("User's Account not found: ", foundBalance?.accountId);
      return;
    }

    console.log("User's Account found: ", foundBalance?.accountId);
    res.status(200).json({
      message: `User: ${foundBalance?.accountId}'s Account is being Deleted`,
      email: foundBalance?.accountId,
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ status: 500, message: error });
  }
};

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
