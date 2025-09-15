import { Request, Response } from "express";
import { pokerDeal, pokerDraw } from "../../services/games/poker.service";
import {
  createGameHistoryforGames,
  gameBalanceforGames,
} from "../../services/games/betAmmount.service";
import { validateGameWithBet } from "../../services/games/gameValidation.service";
import { validateGameAndUser } from "../../services/games/validateGameAndUser.service";
import { Profit } from "../../models/Profit";

export async function pokerDealController(req: Request, res: Response) {
  try {
    const validation = await validateGameWithBet(req, res, "Poker");
    if (!validation) return; // validation already sent response

    const profit = await Profit.findOne();
    const cheatMode =
      Number(profit?.expecting_profit) > Number(profit?.total_profit)
        ? true
        : false;

    const { userId, betAmount, gameId } = validation;
    const result = pokerDeal(userId, Number(betAmount), cheatMode);
    const amount = betAmount;
    const gameHistory = await createGameHistoryforGames(
      userId,
      amount,
      gameId,
      "loss",
      "First Deal"
    );
    await gameBalanceforGames(gameHistory.id);
    console.log(result.gameState);
    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "poker deal failed" });
    return;
  }
}

export async function pokerDrawController(req: Request, res: Response) {
  try {
    const validation = await validateGameAndUser(req, res, "Poker");
    if (!validation) return; // already handled response

    const { userId, gameId } = validation;
    const { holdIndices } = req.body as { holdIndices: number[] };
    if (!holdIndices) {
      console.log("holdIndices not found");
      res.status(404).json({ error: "holdIndices not found" });
      return;
    }
    const result = pokerDraw(userId, holdIndices || []);
    console.log(result);
    const amount = result.winAmount;
    if (amount === 0) {
      console.log(
        result.gameState === "gameOver"
          ? `It's a ${result.gameState} & winner is ${result.winner}`
          : `It's a ${result.gameState}`
      );
      res.status(200).json(result);
      return;
    }
    const type = result.winner === "Dealer" ? "loss" : "win";
    const description =
      result.winner === "Push" ? "it's a draw" : `Winner is ${result.winner}`;
    const gameHistory = await createGameHistoryforGames(
      userId,
      amount,
      gameId,
      type,
      description
    );
    await gameBalanceforGames(gameHistory.id);
    console.log(
      result.gameState === "gameOver"
        ? `It's a ${result.gameState} & winner is ${result.winner}`
        : `It's a ${result.gameState}`
    );
    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "poker draw failed" });
    return;
  }
}
