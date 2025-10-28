import { GameHistory } from "../models/GameHistory";
import { fn, col } from "sequelize";

export async function userGameSummary(userId: string) {
  const [winStats, loseStats, totalPlay] = await Promise.all([
    GameHistory.findOne({
      where: { userId, type: "win" },
      attributes: [
        [fn("COUNT", col("id")), "count"],
        [fn("SUM", col("amount")), "total"],
      ],
      raw: true,
    }) as unknown as { count: number; total: number },

    GameHistory.findOne({
      where: { userId, type: "lose" },
      attributes: [
        [fn("COUNT", col("id")), "count"],
        [fn("SUM", col("amount")), "total"],
      ],
      raw: true,
    }) as unknown as { count: number; total: number },

    GameHistory.count({ where: { userId } }),
  ]);

  const winAmount = Number(winStats?.count || 0);
  const loseAmount = Number(loseStats?.count || 0);
  const winTotal = Number(winStats?.total || 0);
  const loseTotal = Number(loseStats?.total || 0);

  const percentageOfWin = totalPlay > 0 ? (winAmount / totalPlay) * 100 : 0;

  return {
    winAmount,
    loseAmount,
    winTotal,
    loseTotal,
    totalPlay,
    percentageOfWin,
  };
}
