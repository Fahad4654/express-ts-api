import { Request, Response } from "express";
import {
  faStart,
  faPick,
  faCashout,
} from "../../services/games/fortuneApple.service";
import {
  createGameHistoryforGames,
  gameBalanceforGames,
} from "../../services/games/betAmmount.service";
import { validateGameWithBet } from "../../services/games/gameValidation.service";
import { validateGameAndUser } from "../../services/games/validateGameAndUser.service";
import { validateRequiredBody } from "../../services/reqBodyValidation.service";
import { Profit } from "../../models/Profit";

export async function faStartController(req: Request, res: Response) {
  try {
    const validation = await validateGameWithBet(req, res, "Fortune apple");
    if (!validation) return; // validation already sent response

    const profit = await Profit.findOne();
    const cheatMode =
      Number(profit?.expecting_profit) > Number(profit?.total_profit)
        ? true
        : false;

    const { userId, betAmount, gameId } = validation;
    const result = faStart(userId, Number(betAmount), cheatMode);
    const amount = betAmount;
    const gameHistory = await createGameHistoryforGames(
      userId,
      amount,
      gameId,
      "lose",
      "First Deal"
    );
    await gameBalanceforGames(gameHistory.id);
    console.log(`${userId} is ${result.gameState}`);
    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "start failed" });
    return;
  }
}

export async function faPickController(req: Request, res: Response) {
  try {
    const validation = await validateGameAndUser(req, res, "Fortune apple");
    if (!validation) return; // already handled response

    const { userId } = validation;
    const reqBodyValidation = validateRequiredBody(req, res, [
      "level",
      "appleIndex",
    ]);
    if (!reqBodyValidation) return;
    const { level, appleIndex } = req.body;

    const result = faPick(userId, Number(level), Number(appleIndex));
    console.log(
      result.gameState === "gameOver"
        ? `${userId} choose Good apple & won`
        : `${userId} is ${result.gameState}`
    );
    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "pick failed" });
    return;
  }
}

export async function faCashoutController(req: Request, res: Response) {
  try {
    const validation = await validateGameAndUser(req, res, "Fortune apple");
    if (!validation) return; // already handled response

    const { userId, gameId } = validation;

    const result = faCashout(userId);
    const amount = result.finalWinAmount;
    if (amount === 0) {
      console.log(`${userId} choose bad apple`);
      res.status(200).json(result);
      return;
    }
    const type = "win";
    const gameHistory = await createGameHistoryforGames(
      userId,
      amount,
      gameId,
      type,
      `${type} ${amount} by playing Fortune Apple`
    );
    await gameBalanceforGames(gameHistory.id);
    console.log(`${userId} cashed out`);
    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "cashout failed" });
    return;
  }
}
