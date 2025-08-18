import { Account } from "../models/Account";
import { User } from "../models/User";
import { Balance } from "../models/Balance";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { findUserById } from "./user.service";
import { getAccountById } from "./account.service";
import { Game } from "../models/Game";
import { GameHistory } from "../models/GameHistory";

export async function findAllGame(order: string, asc: string) {
  console.log(`Fetching all games, order: ${order}, asc: ${asc}`);
  const games = await Game.findAll({
    raw: true,
    order: [[order || "id", asc || "ASC"]],
  });
  console.log(`Found ${games.length} games`);
  return games;
}

export async function findAllGameHistory(order: string, asc: string) {
  console.log(`Fetching all game history, order: ${order}, asc: ${asc}`);
  const gamesHistory = await GameHistory.findAll({
    raw: true,
    order: [[order || "createdAt", asc || "DESC"]],
  });
  console.log(`Found ${gamesHistory.length} game history`);
  return gamesHistory;
}

export async function findGameById(id: string) {
  console.log(`[Service] Fetching transaction with ID: ${id}`);
  const game = await Game.findOne({
    where: { id },
    raw: true,
  });
  console.log(`[Service] Transaction ${id} ${game ? "found" : "not found"}`);
  return game;
}

export async function findGameHistoryByAnyId(
  id?: string,
  userId?: string,
  accountId?: string,
  balanceId?: string,
  gameId?: string,
  order?: string,
  asc?: string
) {
  console.log(
    `[Service] Find GameHistory with id=${id}, userId=${userId}, accountId=${accountId}, balanceId=${balanceId}, gameId=${gameId}`
  );

  // Collect all provided arguments
  const provided = [
    { key: "id", value: id },
    { key: "userId", value: userId },
    { key: "accountId", value: accountId },
    { key: "balanceId", value: balanceId },
    { key: "gameId", value: gameId },
  ].filter((x) => x.value !== undefined);

  // Validate: must be exactly one
  if (provided.length !== 1) {
    throw new Error(
      "Provide exactly one of id, userId, accountId, balanceId, or gameId"
    );
  }

  const { key, value } = provided[0];
  const whereClause: any = { [key]: value };

  const found = await GameHistory.findAll({
    where: whereClause,
    raw: true,
    order: [[order || "id", asc || "ASC"]],
  });

  if (!found || found.length === 0) {
    throw new Error(`No GameHistory found for ${key}=${value}`);
  }

  console.log(
    `[Service] Found ${found.length} GameHistory record(s) for ${key}=${value}`
  );

  return found;
}

export async function createGame(data: any) {
  console.log(`[Service] Creating new game`, data);

  const { name, description, minimumBet, status } = data;

  const newGame = await Game.create({ name, description, minimumBet, status });
  console.log(`[Service] Transaction created successfully: ${newGame}`);
  return newGame;
}

export async function createGameHistory(data: any) {
  console.log(`[Service] Creating new transaction`, data);

  const {
    balanceId,
    accountId,
    userId,
    gameId,
    type,
    direction,
    amount,
    currency,
    description,
  } = data;

  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");

  const game = await findUserById(gameId);
  if (!game) throw new Error("Game not found");

  const account = await getAccountById(accountId);
  console.log(account);
  if (!account) throw new Error("Account not found");

  if (account.userId !== userId)
    throw new Error("Account does not belong to the specified user");

  const balance = await Balance.findByPk(balanceId);
  if (!balance) throw new Error("Balance not found");

  if (balance.accountId !== accountId)
    throw new Error("Balance does not belong to the specified account");

  if (!type) throw new Error("Type not found");

  if (!direction) throw new Error("Direction not found");

  if (!amount) throw new Error("Amount not found");

  if (!currency) throw new Error("Currency not found");

  // if (Number(amount) < 100)
  //   throw new Error("Amount should be more than or equal to 100");
  // if (Number(amount) > 10000 && direction === "debit")
  //   throw new Error("Amount should be less than or equal to 10000");

  const newGameHistory = await GameHistory.create({
    balanceId,
    accountId,
    userId,
    gameId,
    type,
    direction,
    amount,
    currency,
    description,
  });
  console.log(
    `[Service] Transaction created successfully with ID: ${newGameHistory.id}`
  );
  return newGameHistory;
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
