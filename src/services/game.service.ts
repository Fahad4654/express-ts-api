import { Account } from "../models/Account";
import { User } from "../models/User";
import { Balance } from "../models/Balance";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { Game } from "../models/Game";
import { GameHistory } from "../models/GameHistory";
import { findByDynamicId } from "./find.service";

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
  if (account.userId !== userId)
    throw new Error("Account does not belong to the specified user");

  if (balance.accountId !== accountId)
    throw new Error("Balance does not belong to the specified account");

  if (!type) throw new Error("Type not found");

  if (!direction) throw new Error("Direction not found");

  if (!amount) throw new Error("Amount not found");

  if (!currency) throw new Error("Currency not found");

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

export async function deleteGameById(id?: string) {
  if (!id) {
    throw new Error("ID not found");
  }

  const foundGame = await findByDynamicId(Game, { id: id }, false);

  if (!foundGame) throw new Error(`Game with id ${id} not found`);

  await Game.destroy({ where: { id } });

  console.log(`[Service] ${`Game ${id}`} deleted`);

  return { id };
}

export async function deleteGameHistoryByIdOrUserId(
  id?: string,
  userId?: string
) {
  console.log(
    `[Service] Deleting Game History(s) by ${
      id ? `id: ${id}` : `userId: ${userId}`
    }`
  );
  const whereClause = id ? { id } : { userId };
  const foundGameHistory = await GameHistory.findOne({
    where: whereClause,
  });

  if (!foundGameHistory)
    throw new Error(
      id
        ? `Game History with id ${id} not found`
        : `No Game History found for user ${userId}`
    );

  await GameHistory.destroy({ where: whereClause });

  console.log(
    `[Service] ${
      id ? `Game History ${id}` : `All Game History for user ${userId}`
    } deleted`
  );

  return { id, userId };
}

export async function updateGameById(id: string, updates: any) {
  console.log(`[Service] Updating Game with ID: ${id}`, updates);

  const game = await Game.findOne({ where: { id } });
  if (!game) throw new Error("Game not found");

  const allowedFields: Array<keyof Game> = [
    "name",
    "description",
    "minimumBet",
    "status",
  ];

  const filteredUpdates: Partial<Game> = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  if (!Object.keys(filteredUpdates).length) {
    throw new Error("No valid fields provided for update");
  }

  await game.update(filteredUpdates);

  console.log(`[Service] Game: ${id} updated successfully`);

  return Game.findByPk(id, {
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
}

export async function updatGameHistoryById(id: string, updates: any) {
  console.log(`[Service] Updating Game History with ID: ${id}`, updates);

  const transaction = await GameHistory.findOne({ where: { id } });
  if (!transaction) throw new Error("Transaction not found");

  const allowedFields: Array<keyof GameHistory> = [
    "balanceId",
    "accountId",
    "userId",
    "gameId",
    "type",
    "direction",
    "amount",
    "currency",
    "description",
  ];

  const filteredUpdates: Partial<GameHistory> = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  if (!Object.keys(filteredUpdates).length) {
    throw new Error("No valid fields provided for update");
  }

  await transaction.update(filteredUpdates);

  console.log(`[Service] Game History: ${id} updated successfully`);

  return GameHistory.findByPk(id, {
    attributes: { exclude: ["createdAt", "updatedAt"] },
  });
}
