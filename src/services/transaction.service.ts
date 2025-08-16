import { Account } from "../models/Account";
import { User } from "../models/User";
import { Balance } from "../models/Balance";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { findUserById } from "./user.service";
import { getAccountById } from "./account.service";
import { updateBalancePendingService } from "./balance.service";

export async function findAllTransactions(order: string, asc: string) {
  console.log(`Fetching all transactions, order: ${order}, asc: ${asc}`);
  const transactions = await BalanceTransaction.findAll({
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
  console.log(`Found ${transactions.length} transactions`);
  return transactions;
}

export async function findTransactionById(id: string) {
  console.log(`[Service] Fetching transaction with ID: ${id}`);
  const transaction = await BalanceTransaction.findOne({
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
  console.log(
    `[Service] Transaction ${id} ${transaction ? "found" : "not found"}`
  );
  return transaction;
}

export async function findTransactionsByUserId(
  userId: string,
  order = "id",
  asc = "ASC"
) {
  console.log(`[Service] Fetching transactions for userId: ${userId}`);
  const transactions = await BalanceTransaction.findAll({
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
    order: [[order, asc]],
  });
  console.log(
    `[Service] Found ${transactions.length} transactions for userId: ${userId}`
  );
  return transactions;
}

export async function createNewTransaction(data: any) {
  console.log(`[Service] Creating new transaction`, data);
  const { status, ...rest } = data; // remove status if present
  const payload = { ...rest, status: "pending" };

  const { balanceId, accountId, userId } = data;

  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");

  const account = await getAccountById(accountId);
  console.log(account);
  if (!account) throw new Error("Account not found");

  if (account.userId !== userId)
    throw new Error("Account does not belong to the specified user");

  const balance = await Balance.findByPk(balanceId);
  if (!balance) throw new Error("Balance not found");

  if (balance.accountId !== accountId)
    throw new Error("Balance does not belong to the specified account");

  const newTransaction = await BalanceTransaction.create(payload);
  console.log(
    `[Service] Transaction created successfully with ID: ${newTransaction.id}`
  );

  await updateBalancePendingService(
    balanceId,
    newTransaction.amount,
    newTransaction.direction
  );
  return newTransaction;
}

export async function deleteTransactionByIdOrUserId(
  id?: string,
  userId?: string
) {
  console.log(
    `[Service] Deleting transaction(s) by ${
      id ? `id: ${id}` : `userId: ${userId}`
    }`
  );
  const whereClause = id ? { id } : { userId };
  const foundTransaction = await BalanceTransaction.findOne({
    where: whereClause,
  });

  if (!foundTransaction)
    throw new Error(
      id
        ? `Transaction with id ${id} not found`
        : `No transactions found for user ${userId}`
    );

  await BalanceTransaction.destroy({ where: whereClause });

  console.log(
    `[Service] ${
      id ? `Transaction ${id}` : `All transactions for user ${userId}`
    } deleted`
  );

  return { id, userId };
}

export async function updateTransactionById(id: string, updates: any) {
  console.log(`[Service] Updating transaction with ID: ${id}`, updates);

  const transaction = await BalanceTransaction.findOne({ where: { id } });
  if (!transaction) throw new Error("Transaction not found");

  const allowedFields: Array<keyof BalanceTransaction> = [
    "type",
    "direction",
    "amount",
    "currency",
    "description",
    "referenceId",
    "status",
  ];

  const filteredUpdates: Partial<BalanceTransaction> = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  if (!Object.keys(filteredUpdates).length) {
    throw new Error("No valid fields provided for update");
  }

  await transaction.update(filteredUpdates);

  console.log(`[Service] Transaction ${id} updated successfully`);

  return BalanceTransaction.findByPk(id, {
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
}
