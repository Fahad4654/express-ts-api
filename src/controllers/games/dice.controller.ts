import { Request, Response } from "express";
import { rollDice } from "../../services/games/dice.service";
import {
  createGameHistory,
  gameBalance,
} from "../../services/games/betAmmount.service";
import { Game } from "../../models/Game";
import { findByDynamicId } from "../../services/find.service";

export async function rollDiceController(req: Request, res: Response) {
  try {
    const user = req.user;
    const typedGame = await findByDynamicId(
      Game,
      { name: "Dice roller" },
      false
    );
    const game = typedGame as Game | null;
    const gameId = game?.id;
    if (!user) {
      console.log("User not found");
      res.status(404).json({ error: "User not found" });
      return;
    }

    if (!gameId) {
      console.log("Game not found");
      res.status(404).json({ error: "Game not found" });
      return;
    }
    const { betAmount, betType, numDice } = req.body;

    if (!betAmount || Number(betAmount) <= 0) {
      res.status(400).json({ error: "betAmount must be > 0" });
      return;
    }
    if (!["low", "high", "exact"].includes(betType)) {
      res.status(400).json({ error: "betType must be low|high|exact" });
      return;
    }

    const result = rollDice(Number(betAmount), betType, Number(numDice) || 3);

    const type = result.isWin ? "win" : "loss";
    if (Number(betAmount) > 10000) {
      res
        .status(400)
        .json({ error: "Amount should be less than or equal to 10000" });
      return;
    }

    const amount = result.isWin ? result.winAmount : betAmount;
    const gameHistory = await createGameHistory(user.id, amount, gameId, type);
    await gameBalance(gameHistory.id);
    console.log(result);

    // TODO: persist and update balances, game history

    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "dice roll failed" });
    return;
  }
}
