import { Request, Response } from "express";
import { spinSlot } from "../../services/games/slot.service";
import {
  createGameHistory,
  gameBalance,
} from "../../services/games/betAmmount.service";
import { findByDynamicId } from "../../services/find.service";
import { Game } from "../../models/Game";

export async function spinSlotController(req: Request, res: Response) {
  try {
    const user = req.user;
    const typedGame = await findByDynamicId(Game, { name: "Slot" }, false);
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

    const { betAmount } = req.body;
    if (!betAmount || Number(betAmount) < game?.minimumBet) {
      console.log("Invalid bet amount");
      res.status(400).json({ error: "Invalid bet amount" });
      return;
    }

    const result = spinSlot(betAmount);
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
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
