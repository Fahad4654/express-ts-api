import { Request, Response } from "express";
import { pokerDeal, pokerDraw } from "../../services/games/poker.service";

export async function pokerDealController(req: Request, res: Response) {
  try {
    const userId = req.user?.id!;
    const { betAmount } = req.body;
    if (!betAmount || Number(betAmount) <= 0) {
      res.status(400).json({ error: "betAmount must be > 0" });
      return;
    }
    const result = pokerDeal(userId, Number(betAmount));
    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "poker deal failed" });
    return;
  }
}

export async function pokerDrawController(req: Request, res: Response) {
  try {
    const userId = req.user?.id!;
    const { holdIndices } = req.body as { holdIndices: number[] };
    const result = pokerDraw(userId, holdIndices || []);
    res.status(200).json(result);
    return;
  } catch (e: any) {
    res.status(500).json({ error: e?.message ?? "poker draw failed" });
    return;
  }
}
