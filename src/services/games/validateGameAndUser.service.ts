import { Request, Response } from "express";
import { findByDynamicId } from "../../services/find.service";
import { Game } from "../../models/Game";

export interface GameUserValidationResult {
  userId: string;
  gameId: string;
  game: Game;
}

export async function validateGameAndUser(
  req: Request,
  res: Response,
  gameName: string
): Promise<GameUserValidationResult | null> {
  const user = req.user;
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return null;
  }

  const typedGame = await findByDynamicId(Game, { name: gameName }, false);
  const game = typedGame as Game | null;

  if (!game) {
    res.status(404).json({ error: "Game not found" });
    return null;
  }

  return {
    userId: user.id,
    gameId: game.id,
    game,
  };
}
