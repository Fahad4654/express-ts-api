import { Account } from "../models/Account";
import { Request, RequestHandler, Response } from "express";
import { User } from "../models/User";
import { BalanceTransaction } from "../models/BalanceTransaction";

//User Transaction
export const getTransaction: RequestHandler = async (req, res) => {
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

    const userTransactions = await BalanceTransaction.findAll({
      include: [
        {
          model: User,
          // Optionally exclude account fields if needed
          attributes: ["id", "name", "email", "phoneNumber"],
        },
        {
          model: Account,
          attributes: ["id", "accountNumber", "status"],
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
    console.log("Users list:", userTransactions);
    res.status(201).json({
      message: "User fetching successfully",
      userTransactions: userTransactions,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json(error);
  }
};

//get Transaction by Transaction ID
export async function getTransactionsByID(req: Request, res: Response) {
  try {
    const { id, userId } = req.params; // Assuming /transaction/:id or /transaction/user/:userId

    if (!id && !userId) {
      res.status(400).json({
        status: 400,
        error:
          "Either transaction ID or userId is required as a route parameter",
      });
      return;
    }

    let result;

    if (id) {
      // Get transaction by ID
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
    } else if (userId) {
      // Get all transactions by userId
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

      if (!result || result.length === 0) {
        res.status(404).json({
          status: 404,
          message: `No transactions found for userId ${userId}`,
        });
        return;
      }
    }

    res.status(200).json({
      status: 200,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    res.status(500).json({
      status: 500,
      message: "Internal server error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

//Create Transaction
export async function createTransaction(req: Request, res: Response) {
  console.log(req.body);
  const {
    balanceId,
    accountId,
    userId,
    type,
    direction,
    amount,
    currency,
    description,
    referenceId,
    status,
  } = req.body;
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      return;
    }
    const newTransaction = await BalanceTransaction.create({
      balanceId,
      accountId,
      userId,
      type,
      direction,
      amount,
      currency,
      description,
      referenceId,
      status,
    });

    res.status(201).json({
      message: "User Account created successfully",
      transaction: newTransaction,
      status: "success",
    });
  } catch (error: any) {
    console.error("Error creating user:", error);
    res.status(500).json({ status: 500, message: error });
  }
}

//Delete User Account
export const deleteTransaction: RequestHandler = async (req, res) => {
  try {
    const { id, userId } = req.body;

    if (!id && !userId) {
      res.status(400).json({ error: "id or userId is required" });
      return;
    }

    if (id && userId) {
      res.status(400).json({ error: "Provide only id OR userId, not both" });
      return;
    }

    const whereClause = id ? { id } : { userId };

    const foundTransaction = await BalanceTransaction.findOne({
      where: whereClause,
      attributes: ["id", "userId", "accountId"],
    });

    if (!foundTransaction) {
      res.status(404).json({
        error: "Transaction not found",
        message: id
          ? `Transaction with id ${id} not found`
          : `No transactions found for user ${userId}`,
      });
      return;
    }

    const deletedCount = await BalanceTransaction.destroy({
      where: whereClause,
    });

    if (deletedCount === 0) {
      res.status(404).json({ error: "Nothing deleted" });
      return;
    }

    res.status(200).json({
      message: id
        ? `Transaction ${id} deleted successfully`
        : `All transactions for user ${userId} deleted successfully`,
    });
    return;
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ status: 500, message: error });
    return;
  }
};

export async function updateTransaction(req: Request, res: Response) {
  try {
    if (!req.body) {
      res.status(400).json({ error: "request body is required" });
      console.log("request body is required");
      return;
    }
    const { id } = req.body;

    if (!id) {
      res.status(400).json({ error: "Id is required" });
      console.log("Id is required");
      return;
    }

    // Find the account associated with the user
    const transaction = await BalanceTransaction.findOne({ where: { id } });

    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      console.log("Transaction not found");
      return;
    }

    // Define allowed fields that can be updated with type safety
    const allowedFields: Array<keyof BalanceTransaction> = [
      "type",
      "direction",
      "amount",
      "currency",
      "description",
      "referenceId",
      "status",
    ];
    const updates: Partial<BalanceTransaction> = {};

    // Filter and only take allowed fields from req.body with type checking
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    // If no valid updates were provided
    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "No valid fields provided for update" });
      console.log("No valid fields provided for update");
      return;
    }

    // Perform the update
    await transaction.update(updates);

    // Get the updated account (excluding sensitive fields if needed)
    const updatedTransaction = await Account.findByPk(transaction.id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    console.log("Account updated successfully, account: ", updatedTransaction);
    res.status(200).json({
      message: "Account updated successfully",
      data: updatedTransaction,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating account:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update account",
      error: error instanceof Error ? error.message : error,
    });
  }
}
