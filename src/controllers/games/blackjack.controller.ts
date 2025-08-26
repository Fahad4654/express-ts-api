import { Request, Response } from "express";
import { bjDeal, bjHit, bjStand } from "../../services/games/blackjack.service";
import {
  createGameHistoryforGames,
  gameBalanceforGames,
} from "../../services/games/betAmmount.service";
import { findByDynamicId } from "../../services/find.service";
import { Game } from "../../models/Game";

export async function bjDealController(req: Request, res: Response) {
  try {
    const user = req.user;
    const typedGame = await findByDynamicId(
      Game,
      { name: "Black jack" },
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
    const { betAmount } = req.body;
    if (!betAmount || Number(betAmount) < Number(game?.minimumBet)) {
      console.log("Invalid bet amount");
      res.status(400).json({ error: "Invalid bet amount" });
      return;
    }
    if (Number(betAmount) > 10000) {
      res
        .status(400)
        .json({ error: "Amount should be less than or equal to 10000" });
      return;
    }
    const result = bjDeal(user.id, Number(betAmount));
    const amount = betAmount;
    const gameHistory = await createGameHistoryforGames(
      user.id,
      amount,
      gameId,
      "loss",
      "First Deal"
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
    res.status(500).json({ error: e?.message ?? "deal failed" });
    return;
  }
}

export async function bjHitController(req: Request, res: Response) {
  try {
    const user = req.user;
    const typedGame = await findByDynamicId(
      Game,
      { name: "Black jack" },
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
    const result = bjHit(user.id);
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
      user.id,
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
    res.status(500).json({ error: e?.message ?? "hit failed" });
    return;
  }
}

export async function bjStandController(req: Request, res: Response) {
  try {
    const user = req.user;
    const typedGame = await findByDynamicId(
      Game,
      { name: "Black jack" },
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
    const result = bjStand(user.id);
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
      user.id,
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
    res.status(500).json({ error: e?.message ?? "stand failed" });
    return;
  }
}
