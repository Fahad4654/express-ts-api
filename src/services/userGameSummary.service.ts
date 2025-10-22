import { GameHistory } from "../models/GameHistory";

export async function userGameSummary(userId: string) {
  const [winAmount, loseAmount, totalPlay] = await Promise.all([
    GameHistory.count({ where: { userId, type: "win" } }),
    GameHistory.count({ where: { userId, type: "lose" } }),
    GameHistory.count({ where: { userId } }),
  ]);

  const percentageOfWin =
    totalPlay > 0 ? (winAmount / totalPlay) * 100 : 0;

  return { winAmount, loseAmount, totalPlay, percentageOfWin };
}
