import { Request, Response } from "express";
import { spinSlot } from "../../services/games/slot.service";
import {
  createGameHistoryforGames,
  gameBalanceforGames,
} from "../../services/games/betAmmount.service";
import { validateGameWithBet } from "../../services/games/gameValidation.service";
import { Profit } from "../../models/Profit";

export async function spinSlotController(req: Request, res: Response) {
  try {
    const validation = await validateGameWithBet(req, res, "Slot");
    if (!validation) return; // validation already sent response

    const profit = await Profit.findOne();
    const cheatMode =
      Number(profit?.expecting_profit) > Number(profit?.total_profit)
        ? true
        : false;

    const { userId, betAmount, gameId } = validation;

    const result = await spinSlot(betAmount, cheatMode);
    const type = result.isWin ? "win" : "loss";

    const amount = result.isWin ? result.winAmount : betAmount;
    const gameHistory = await createGameHistoryforGames(
      userId,
      amount,
      gameId,
      type,
      `${type} ${amount} by playing Slot`
    );
    await gameBalanceforGames(gameHistory.id);
    console.log(result);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
