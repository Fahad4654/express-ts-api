import { Request, Response } from "express";
import { rollDice } from "../../services/games/dice.service";
import {
  createGameHistoryforGames,
  gameBalanceforGames,
} from "../../services/games/betAmmount.service";
import { validateGameWithBet } from "../../services/games/gameValidation.service";
import { validateRequiredBody } from "../../services/reqBodyValidation.service";
import { Profit } from "../../models/Profit";

export async function rollDiceController(req: Request, res: Response) {
  try {
    const betValidation = await validateGameWithBet(req, res, "Dice roller");
    if (!betValidation) return; // validation already sent response

    const profit = await Profit.findOne();
    const cheatMode =
      Number(profit?.expecting_profit) > Number(profit?.total_profit)
        ? true
        : false;

    const { userId, betAmount, gameId } = betValidation;

    const reqBodyValidation = validateRequiredBody(req, res, [
      "betAmount",
      "betType",
      "numDice",
    ]);
    if (!reqBodyValidation) return;

    const { betType, numDice } = req.body;

    if (!["low", "high", "exact"].includes(betType)) {
      res.status(400).json({ error: "betType must be low|high|exact" });
      return;
    }

    if (Number(betAmount) > 10000) {
      res
        .status(400)
        .json({ error: "Amount should be less than or equal to 10000" });
      return;
    }

    const result = rollDice(
      Number(betAmount),
      betType,
      Number(numDice) || 3,
      cheatMode
    );

    const type = result.isWin ? "win" : "loss";

    const amount = result.isWin ? result.winAmount : betAmount;
    const gameHistory = await createGameHistoryforGames(
      userId,
      amount,
      gameId,
      type,
      `${type} ${amount} by playing Dice roller`
    );
    await gameBalanceforGames(gameHistory.id);
    console.log(result);

    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "dice roll failed" });
    return;
  }
}
