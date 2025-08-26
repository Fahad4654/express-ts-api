import { Request, Response } from "express";
import {
  faStart,
  faPick,
  faCashout,
} from "../../services/games/fortuneApple.service";
import { findByDynamicId } from "../../services/find.service";
import { Game } from "../../models/Game";
import {
  createGameHistoryforGames,
  gameBalanceforGames,
} from "../../services/games/betAmmount.service";

export async function faStartController(req: Request, res: Response) {
  try {
    const user = req.user;
    const typedGame = await findByDynamicId(
      Game,
      { name: "Fortune apple" },
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
    const result = faStart(user.id, Number(betAmount));
    const amount = betAmount;
    const gameHistory = await createGameHistoryforGames(
      user.id,
      amount,
      gameId,
      "loss",
      "First Deal"
    );
    await gameBalanceforGames(gameHistory.id);
    console.log(`${user.id} is ${result.gameState}`);
    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "start failed" });
    return;
  }
}

export async function faPickController(req: Request, res: Response) {
  try {
    const user = req.user;
    const typedGame = await findByDynamicId(
      Game,
      { name: "Fortune apple" },
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
    const { level, appleIndex } = req.body;

    if (!level) {
      console.log("Level not found");
      res.status(404).json({ error: "Level not found" });
      return;
    }

    if (!appleIndex) {
      console.log("Apple Index not found");
      res.status(404).json({ error: "Apple Index not found" });
      return;
    }
    const result = faPick(user.id, Number(level), Number(appleIndex));
    console.log(
      result.gameState === "gameOver"
        ? `${user.id} choose Good apple & won`
        : `${user.id} is ${result.gameState}`
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
    const user = req.user;
    const typedGame = await findByDynamicId(
      Game,
      { name: "Fortune apple" },
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
    const result = faCashout(user.id);
    const amount = result.finalWinAmount;
    if (amount === 0) {
      console.log(`${user.id} choose bad apple`);
      res.status(200).json(result);
      return;
    }
    const type = "win";
    const gameHistory = await createGameHistoryforGames(
      user.id,
      amount,
      gameId,
      type
    );
    await gameBalanceforGames(gameHistory.id);
    console.log(`${user.id} cashed out`);
    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "cashout failed" });
    return;
  }
}
