import { Balance } from "../models/Balance";
import { Account } from "../models/Account";
import { User } from "../models/User";
import { sequelize } from "../config/database";
import { BalanceTransaction } from "../models/BalanceTransaction";

export async function findAllBalances(order = "createdAt", asc = "ASC") {
  return Balance.findAll({
    include: [
      {
        model: Account,
        attributes: ["id", "userId", "accountNumber"],
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
          },
        ],
      },
    ],
    nest: true,
    raw: true,
    order: [[order, asc]],
  });
}

export async function findBalanceByAccountId(accountId: string) {
  return Balance.findOne({
    where: { accountId },
    include: [
      {
        model: Account,
        attributes: ["id", "userId", "accountNumber"],
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
          },
        ],
      },
    ],
    nest: true,
    raw: true,
  });
}

export async function findBalanceById(id: string) {
  return Balance.findOne({
    where: { id },
    include: [
      {
        model: Account,
        attributes: ["id", "userId", "accountNumber"],
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
          },
        ],
      },
    ],
    nest: true,
    raw: true,
  });
}

export async function createBalance(data: Partial<Balance>) {
  return Balance.create(data);
}

export async function deleteBalanceByAccountId(accountId: string) {
  const deletedCount = await Balance.destroy({ where: { accountId } });
  if (deletedCount === 0) throw new Error("Balance not found");
  return deletedCount;
}

export async function updateBalanceByAccountId(
  accountId: string,
  updates: Partial<Balance>
) {
  return sequelize.transaction(async (t) => {
    const balance = await Balance.findOne({
      where: { accountId },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!balance) {
      throw new Error("Balance not found");
    }

    const allowedFields: Array<keyof Balance> = [
      "availableBalance",
      "pendingBalance",
      "holdBalance",
      "currency",
      "lastTransactionAt",
    ];

    const filteredUpdates: Partial<Balance> = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        if (
          ["availableBalance", "pendingBalance", "holdBalance"].includes(key)
        ) {
          const numVal = Number(updates[key]);
          if (isNaN(numVal)) {
            throw new Error(`${key} must be a number`);
          }
          filteredUpdates[key] = numVal as any;
        } else if (key === "lastTransactionAt") {
          const dateVal = new Date(updates[key] as any);
          if (isNaN(dateVal.getTime())) {
            throw new Error(`${key} must be a valid date`);
          }
          filteredUpdates[key] = dateVal as any;
        } else {
          filteredUpdates[key] = updates[key];
        }
      }
    }

    if (Object.keys(filteredUpdates).length === 0) {
      throw new Error("No valid fields provided for update");
    }

    await balance.update(filteredUpdates, { transaction: t });

    return balance;
  });
}

export async function updateBalancePendingService(
  balanceId: string,
  amount: number,
  direction: "credit" | "debit"
) {
  return sequelize.transaction(async (t) => {
    const balance = await Balance.findByPk(balanceId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!balance) throw new Error("Balance not found");

    if (direction === "credit") {
      balance.pendingBalance = Number(balance.pendingBalance) + Number(amount);
    } else if (direction === "debit") {
      balance.pendingBalance = Number(balance.pendingBalance) - Number(amount);
    }

    await balance.save({ transaction: t });
    return balance;
  });
}

export async function finalizeTransaction(
  balanceId: string,
  transactionId: string
) {
  return sequelize.transaction(async (t) => {
    const balance = await Balance.findByPk(balanceId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!balance) {
      throw new Error("Balance not found");
    }

    console.log(balance.pendingBalance);

    if (balance.pendingBalance == 0) {
      console.log("Balance pending balance is 0");
      return;
    }

    const transaction = await BalanceTransaction.findByPk(transactionId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!transaction) {
      throw new Error("Transaction not found");
    }

    if (transaction.status === "completed") {
      console.log("Transaction is already completed");
      throw new Error("Transaction is already completed");
    }
    // Move from pending to available or subtract for debit
    // balance.pendingBalance = Number(balance.pendingBalance) - Number(amount);
    if (transaction.direction === "credit") {
      balance.availableBalance =
        Number(balance.availableBalance) + Number(transaction.amount);
      balance.pendingBalance =
        Number(balance.pendingBalance) - Number(transaction.amount);
    } else if (transaction.direction === "debit") {
      balance.availableBalance =
        Number(balance.availableBalance) - Number(transaction.amount);
    }

    transaction.status = "completed"; // or "failed" if debit failed
    await transaction.save({ transaction: t });

    balance.lastTransactionAt = new Date();
    await balance.save({ transaction: t });
    return { balance, transaction };
  });
}
