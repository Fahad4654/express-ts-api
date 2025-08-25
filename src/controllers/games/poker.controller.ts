import { Request, Response } from "express";
import { pokerDeal, pokerDraw } from "../../services/games/poker.service";
import { findByDynamicId } from "../../services/find.service";
import { Game } from "../../models/Game";
import {
  createGameHistory,
  gameBalance,
} from "../../services/games/betAmmount.service";

export async function pokerDealController(req: Request, res: Response) {
  try {
    const user = req.user;
    const typedGame = await findByDynamicId(Game, { name: "Poker" }, false);
    const game = typedGame as Game | null;
    const gameId = game?.id;
    const userId = user?.id!;
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
    if (!betAmount || Number(betAmount) <= 0) {
      res.status(400).json({ error: "betAmount must be > 0" });
      return;
    }
    const result = pokerDeal(userId, Number(betAmount));
    const amount = betAmount;
    const gameHistory = await createGameHistory(
      user.id,
      amount,
      gameId,
      "loss",
      "First Deal"
    );
    await gameBalance(gameHistory.id);
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
    const user = req.user;
    const typedGame = await findByDynamicId(Game, { name: "Poker" }, false);
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
    const userId = user.id;
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
    const gameHistory = await createGameHistory(
      user.id,
      amount,
      gameId,
      type,
      description
    );
    await gameBalance(gameHistory.id);
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
