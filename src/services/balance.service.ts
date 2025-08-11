import { Balance } from "../models/Balance";
import { Account } from "../models/Account";
import { User } from "../models/User";
import { sequelize } from "../config/database";

export async function findAllBalances(order = "createdAt", asc = "ASC") {
  return Balance.findAll({
    include: [
      {
        model: Account,
        attributes: ["id", "userId", "accountNumber"],
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

export async function findUserById(userId: string) {
  return User.findOne({
    where: { id: userId },
    attributes: ["name", "email"],
  });
}

export async function updateBalanceByAccountId(accountId: string, updates: Partial<Balance>) {
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
