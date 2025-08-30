import { Request, Response } from "express";
import { spinSlot } from "../../services/games/slot.service";
import {
  createGameHistoryforGames,
  gameBalanceforGames,
} from "../../services/games/betAmmount.service";
import { validateGameWithBet } from "../../services/games/gameValidation.service";

export async function spinSlotController(req: Request, res: Response) {
  try {
    const validation = await validateGameWithBet(req, res, "Slot");
    if (!validation) return; // validation already sent response

    const { userId, betAmount, gameId } = validation;

    const result = spinSlot(betAmount);
    const type = result.isWin ? "win" : "loss";

    const amount = result.isWin ? result.winAmount : betAmount;
    const gameHistory = await createGameHistoryforGames(
      userId,
      amount,
      gameId,
      type
    );
    await gameBalanceforGames(gameHistory.id);
    console.log(result);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
