import { Account } from "../models/Account";
import { User } from "../models/User";
import { Balance } from "../models/Balance";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { findByDynamicId } from "./find.service";

export async function findAllTransactions(
  order: string,
  asc: string,
  page = 1,
  pageSize = 10
) {
  const offset = (page - 1) * pageSize;
  console.log(`Fetching all transactions, order: ${order}, asc: ${asc}`);
  const { count, rows } = await BalanceTransaction.findAndCountAll({
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
    limit: pageSize,
    offset,
    order: [[order || "id", asc || "ASC"]],
  });
  console.log(`Found ${rows.length} transactions`);
  return {
    data: rows,
    pagination: {
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    },
  };
}

export async function createNewTransaction(data: any) {
  console.log(`[Service] Creating new transaction`, data);
  const { status, ...rest } = data; // remove status if present
  const payload = { ...rest, status: "pending" };

  const {
    balanceId,
    accountId,
    userId,
    type,
    direction,
    amount,
    currency,
    trxId,
  } = data;

  const typedUser = await findByDynamicId(User, { id: userId }, false);
  const user = typedUser as User | null;
  console.log(user);

  if (!user) throw new Error("User not found");

  const typedAccount = await findByDynamicId(Account, { id: accountId }, false);
  const account = typedAccount as Account | null;
  console.log(account);
  if (!account) throw new Error("Account not found");

  if (account.userId !== userId)
    throw new Error("Account does not belong to the specified user");

  const typedBalance = await findByDynamicId(Balance, { id: balanceId }, false);
  const balance = typedBalance as Balance | null;
  if (!balance) throw new Error("Balance not found");

  if (balance.accountId !== accountId)
    throw new Error("Balance does not belong to the specified account");

  if (!type) throw new Error("Type not found");

  if (!direction) throw new Error("Direction not found");

  if (!amount) throw new Error("Amount not found");

  if (!currency) throw new Error("Currency not found");

  if (!trxId) throw new Error("trxId not found");

  if (Number(amount) < 100)
    throw new Error("Amount should be more than or equal to 100");
  if (Number(amount) > 10000 && direction === "debit")
    throw new Error("Amount should be less than or equal to 10000");

  const newTransaction = await BalanceTransaction.create(payload);
  console.log(
    `[Service] Transaction created successfully with ID: ${newTransaction.id}`
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
    "trxId",
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
