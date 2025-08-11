import { BalanceTransaction } from "../models/BalanceTransaction";
import { User } from "../models/User";
import { Account } from "../models/Account";
import { Balance } from "../models/Balance";

export async function findAllTransactions(order = "id", asc = "ASC") {
  return BalanceTransaction.findAll({
    include: [
      { model: User, attributes: ["id", "name", "email", "phoneNumber"] },
      { model: Account, attributes: ["id", "accountNumber", "status"] },
    ],
    nest: true,
    raw: true,
    order: [[order, asc]],
  });
}

export async function findTransactionById(id: string) {
  return BalanceTransaction.findOne({
    where: { id },
    include: [
      { model: User, attributes: ["id", "name", "email", "phoneNumber"] },
      { model: Account, attributes: ["id", "accountNumber", "status"] },
    ],
    nest: true,
    raw: true,
  });
}

export async function findTransactionsByUserId(userId: string, order = "id", asc = "ASC") {
  return BalanceTransaction.findAll({
    where: { userId },
    include: [
      { model: User, attributes: ["id", "name", "email", "phoneNumber"] },
      { model: Account, attributes: ["id", "accountNumber", "status"] },
    ],
    nest: true,
    raw: true,
    order: [[order, asc]],
  });
}

export async function createTransaction(data: {
  balanceId: string;
  accountId: string;
  userId: string;
  type?: string;
  direction?: string;
  amount?: number;
  currency?: string;
  description?: string;
  referenceId?: string;
  status?: string;
}) {
  // Validate user exists
  const user = await User.findByPk(data.userId);
  if (!user) throw new Error("User not found");

  // Validate account exists and belongs to user
  const account = await Account.findByPk(data.accountId);
  if (!account) throw new Error("Account not found");
  if (account.userId !== data.userId) throw new Error("Account does not belong to the specified user");

  // Validate balance exists and belongs to account
  const balance = await Balance.findByPk(data.balanceId);
  if (!balance) throw new Error("Balance not found");
  if (balance.accountId !== data.accountId) throw new Error("Balance does not belong to the specified account");

  // Create the transaction
  return BalanceTransaction.create(data);
}

export async function deleteTransactionByIdOrUserId(id?: string, userId?: string) {
  if (!id && !userId) throw new Error("id or userId is required");
  if (id && userId) throw new Error("Provide only id OR userId");

  const whereClause = id ? { id } : { userId };

  const transaction = await BalanceTransaction.findOne({ where: whereClause });
  if (!transaction) {
    throw new Error(id ? `Transaction with id ${id} not found` : `No transactions found for user ${userId}`);
  }

  await BalanceTransaction.destroy({ where: whereClause });

  return whereClause;
}

export async function updateTransactionById(id: string, updates: Partial<BalanceTransaction>) {
  const transaction = await BalanceTransaction.findOne({ where: { id } });
  if (!transaction) throw new Error("Transaction not found");

  const allowedFields: Array<keyof BalanceTransaction> = [
    "type", "direction", "amount", "currency", "description", "referenceId", "status",
  ];

  const filteredUpdates: Partial<BalanceTransaction> = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = updates[key];
  }

  if (Object.keys(filteredUpdates).length === 0) throw new Error("No valid fields provided for update");

  await transaction.update(filteredUpdates);

  return BalanceTransaction.findByPk(id, { attributes: { exclude: ["createdAt", "updatedAt"] } });
}
