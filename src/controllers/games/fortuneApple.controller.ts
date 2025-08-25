import { Request, Response } from "express";
import {
  faStart,
  faPick,
  faCashout,
} from "../../services/games/fortuneApple.service";

export async function faStartController(req: Request, res: Response) {
  try {
    const userId = req.user?.id!;
    const { betAmount } = req.body;
    if (!betAmount || Number(betAmount) <= 0) {
      res.status(400).json({ error: "betAmount must be > 0" });
      return;
    }
    const result = faStart(userId, Number(betAmount));
    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "start failed" });
    return;
  }
}

export async function faPickController(req: Request, res: Response) {
  try {
    const userId = req.user?.id!;
    const { gameId, level, appleIndex } = req.body;
    if (!gameId || gameId !== userId) {
      res.status(400).json({ error: "invalid gameId" });
      return;
    }
    const result = faPick(userId, Number(level), Number(appleIndex));
    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "pick failed" });
    return;
  }
}

export async function faCashoutController(req: Request, res: Response) {
  try {
    const userId = req.user?.id!;
    const { gameId } = req.body;
    if (!gameId || gameId !== userId) {
      res.status(400).json({ error: "invalid gameId" });
      return;
    }
    const result = faCashout(userId);
    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "cashout failed" });
    return;
  }
}
