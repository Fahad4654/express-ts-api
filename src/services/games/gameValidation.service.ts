import { Request, Response } from "express";
import { findByDynamicId } from "../../services/find.service";
import { Game } from "../../models/Game";
import { Account } from "../../models/Account";
import { Balance } from "../../models/Balance";

interface GameBetValidationResult {
  userId: string;
  gameId: string;
  game: Game;
  betAmount: number;
  balance: Balance;
}

export async function validateGameWithBet(
  req: Request,
  res: Response,
  gameName: string
): Promise<GameBetValidationResult | null> {
  const user = req.user;
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return null;
  }

  const typedGame = await findByDynamicId(Game, { name: gameName }, false);
  const game = typedGame as Game | null;

  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return null;
  }

  const { betAmount } = req.body;

  if (!betAmount || isNaN(Number(betAmount))) {
    res
      .status(400)
      .json({ error: "Bet amount is required and must be a number" });
    return null;
  }

  if (Number(betAmount) < Number(game.minimumBet)) {
    res.status(400).json({ error: "Bet amount is below minimum bet" });
    return null;
  }

  if (Number(betAmount) > Number(game.maximumBet)) {
    res.status(400).json({
      error: `Amount should be less than or equal to ${game.maximumBet}`,
    });
    return null;
  }

  // ✅ check account
  const typedAccount = await findByDynamicId(
    Account,
    { userId: user.id },
    false
  );
  const account = typedAccount as Account | null;
  if (!account) {
    res.status(404).json({ error: "Account not found for user" });
    return null;
  }

  // ✅ check balance
  const typedBalance = await findByDynamicId(
    Balance,
    { accountId: account.id },
    false
  );
  const balance = typedBalance as Balance | null;

  if (!balance) {
    res.status(404).json({ error: "Balance not found for account" });
    return null;
  }

  if (Number(balance.availableBalance) < Number(betAmount)) {
    res.status(400).json({ error: "Insufficient balance for this bet" });
    return null;
  }

  return {
    userId: user.id,
    gameId: game.id,
    game,
    betAmount: Number(betAmount),
    balance,
  };
}
