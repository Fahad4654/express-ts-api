import { sequelize } from "../../config/database";
import { Account } from "../../models/Account";
import { Balance } from "../../models/Balance";
import { GameHistory } from "../../models/GameHistory";
import { User } from "../../models/User";
import { findByDynamicId } from "../find.service";

export async function createGameHistory(
  userId: string,
  amount: number,
  gameId: string,
  type: string,
  description?: string
) {
  console.log(`[Service] Creating new transaction for`, userId);

  const typedUser = await findByDynamicId(User, { id: userId }, false);
  const user = typedUser as User | null;
  console.log(user);

  if (!user) throw new Error("User not found");

  const typedAccount = await findByDynamicId(
    Account,
    { userId: userId },
    false
  );
  const account = typedAccount as Account | null;
  console.log(account);
  if (!account) throw new Error("Account not found");

  const typedBalance = await findByDynamicId(
    Balance,
    { accountId: account.id },
    false
  );
  const balance = typedBalance as Balance | null;
  if (!balance) throw new Error("Balance not found");

  if (!type) throw new Error("Type not found");

  const newGameHistory = await GameHistory.create({
    balanceId: balance.id,
    accountId: account.id,
    userId,
    gameId,
    type,
    direction: type === "win" ? "credit" : "debit",
    amount,
    currency: "BDT",
    description: description ? description : "nothing",
  });
  console.log(
    `[Service] Transaction created successfully with ID: ${newGameHistory.id}`
  );
  return newGameHistory;
}

export async function gameBalance(gameHistoryId: string) {
  return sequelize.transaction(async (t) => {
    const gameHistory = await GameHistory.findByPk(gameHistoryId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!gameHistory) {
      console.log("Game history not found");
      throw new Error("Game history not found");
    }

    const balance = await Balance.findByPk(gameHistory.balanceId, {
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!balance) {
      console.log("Balance not found");
      throw new Error("Balance not found");
    }

    if (gameHistory.direction === "credit") {
      balance.availableBalance =
        Number(balance.availableBalance) + Number(gameHistory.amount);
      balance.withdrawableBalance =
        Number(balance.withdrawableBalance) + Number(gameHistory.amount);
    } else if (gameHistory.direction === "debit") {
      balance.availableBalance =
        Number(balance.availableBalance) - Number(gameHistory.amount);
      if (Number(balance.withdrawableBalance) < gameHistory.amount) {
        balance.withdrawableBalance = 0;
      } else {
        balance.withdrawableBalance =
          Number(balance.withdrawableBalance) - Number(gameHistory.amount);
      }
    }

    balance.lastTransactionAt = new Date();
    await balance.save({ transaction: t });

    return { balance, gameHistory };
  });
}
