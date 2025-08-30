import { Request, Response } from "express";
import { rollDice } from "../../services/games/dice.service";
import {
  createGameHistoryforGames,
  gameBalanceforGames,
} from "../../services/games/betAmmount.service";
import { validateGameWithBet } from "../../services/games/gameValidation.service";
import { validateRequiredBody } from "../../services/reqBodyValidation.service";

export async function rollDiceController(req: Request, res: Response) {
  try {
    const betValidation = await validateGameWithBet(req, res, "Dice roller");
    if (!betValidation) return; // validation already sent response

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

    const result = rollDice(Number(betAmount), betType, Number(numDice) || 3);

    const type = result.isWin ? "win" : "loss";
    if (Number(betAmount) > 10000) {
      res
        .status(400)
        .json({ error: "Amount should be less than or equal to 10000" });
      return;
    }

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
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "dice roll failed" });
    return;
  }
}
