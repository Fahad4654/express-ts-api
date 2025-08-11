import { Request, RequestHandler, Response } from "express";
import { Account } from "../models/Account";
import { User } from "../models/User";
import { Balance } from "../models/Balance";
import { BalanceTransaction } from "../models/BalanceTransaction";

// ======================= GET ALL TRANSACTIONS =======================
export const getTransaction: RequestHandler = async (req, res) => {
  try {
    const { order, asc } = req.body;

    if (!order) {
      res.status(400).json({ error: "Field to sort is required" });
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
          attributes: ["id", "name", "email", "phoneNumber"],
        },
        {
          model: Account,
          attributes: ["id", "accountNumber", "status"],
        },
      ],
      nest: true,
      raw: true,
      order: [[order || "id", asc || "ASC"]],
    });

    res.status(200).json({
      message: "Transaction list fetched successfully",
      transactions: userTransactions,
      status: "success",
    });
  } catch (error) {
    console.error("Error fetching Transaction list:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

// ======================= GET TRANSACTION BY ID / USER ID =======================
export async function getTransactionsByID(req: Request, res: Response) {
  try {
    const { id, userId } = req.params;

    if (!id && !userId) {
      res.status(400).json({
        status: 400,
        error: "Either transaction ID or userId is required",
      });
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
    res.status(500).json({
      status: 500,
      message: "Internal server error",
    });
  }
}

// ======================= CREATE TRANSACTION =======================
export async function createTransaction(req: Request, res: Response) {
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
    if (!balanceId || !accountId || !userId) {
      res.status(400).json({
        error: "balanceId, accountId, and userId are required",
      });
      return;
    }

    // 1️⃣ Check if account belongs to user
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // 1️⃣ Check if account exists
    const account = await Account.findByPk(accountId);
    if (!account) {
      res.status(404).json({ error: "Account not found" });
      return;
    }

    // 2️⃣ Verify account belongs to user
    if (account.userId !== userId) {
      res
        .status(403)
        .json({ error: "Account does not belong to the specified user" });
      return;
    }

    // 3️⃣ Check if balance exists
    const balance = await Balance.findByPk(balanceId);
    if (!balance) {
      res.status(404).json({ error: "Balance not found" });
      return;
    }

    // 4️⃣ Verify balance belongs to account
    if (balance.accountId !== accountId) {
      res
        .status(403)
        .json({ error: "Balance does not belong to the specified account" });
      return;
    }

    // ✅ Create transaction
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
      message: "Transaction created successfully",
      transaction: newTransaction,
      status: "success",
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({
      status: 500,
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

// ======================= DELETE TRANSACTION =======================
export const deleteTransaction: RequestHandler = async (req, res) => {
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
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ status: 500, message: "Internal server error" });
  }
};

// ======================= UPDATE TRANSACTION =======================
export async function updateTransaction(req: Request, res: Response) {
  try {
    const { id } = req.body;
    if (!id) {
      res.status(400).json({ error: "Id is required" });
      return;
    }

    const transaction = await BalanceTransaction.findOne({ where: { id } });
    if (!transaction) {
      res.status(404).json({ error: "Transaction not found" });
      return;
    }

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
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (!Object.keys(updates).length) {
      res.status(400).json({ error: "No valid fields provided for update" });
      return;
    }

    await transaction.update(updates);

    const updatedTransaction = await BalanceTransaction.findByPk(id, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });

    res.status(200).json({
      message: "Transaction updated successfully",
      data: updatedTransaction,
      status: "success",
    });
  } catch (error) {
    console.error("Error updating Transaction:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to update Transaction",
    });
  }
}
