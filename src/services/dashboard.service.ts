import { GameHistory } from "../models/GameHistory";
import { BalanceTransaction } from "../models/BalanceTransaction";
import { Balance } from "../models/Balance";
import { Sequelize } from "sequelize-typescript";

export interface DashboardStatsInterface {
  total_profit: number;
  total_deposits: number;
  total_withdrawals: number;
  total_withdrawable_balance: number;
}

export async function getDashboardStats(): Promise<DashboardStatsInterface> {
  // Profit from games
  const profitResult = (await GameHistory.findOne({
    attributes: [
      [
        Sequelize.fn(
          "COALESCE",
          Sequelize.fn(
            "SUM",
            Sequelize.literal(`
              CASE
                WHEN "type" = 'lose' AND "direction" = 'debit' THEN "amount"
                WHEN "type" = 'win' AND "direction" = 'credit' THEN -"amount"
                ELSE 0
              END
            `)
          ),
          0
        ),
        "total_profit",
      ],
    ],
    raw: true,
  })) as unknown as { total_profit: number };

  // Total deposits (completed)
  const depositResult = (await BalanceTransaction.findOne({
    attributes: [
      [
        Sequelize.fn(
          "COALESCE",
          Sequelize.fn("SUM", Sequelize.col("amount")),
          0
        ),
        "total_deposits",
      ],
    ],
    where: { type: "deposit", status: "completed" },
    raw: true,
  })) as unknown as { total_deposits: number };

  // Total withdrawals (completed)
  const withdrawalResult = (await BalanceTransaction.findOne({
    attributes: [
      [
        Sequelize.fn(
          "COALESCE",
          Sequelize.fn("SUM", Sequelize.col("amount")),
          0
        ),
        "total_withdrawals",
      ],
    ],
    where: { type: "withdrawal", status: "completed" },
    raw: true,
  })) as unknown as { total_withdrawals: number };

  // Withdrawable balance - FIXED: using findOne instead of findAll
  const withdrawableResult = (await Balance.findOne({
    attributes: [
      [
        Sequelize.fn(
          "COALESCE",
          Sequelize.fn("SUM", Sequelize.col("withdrawableBalance")),
          0
        ),
        "total_withdrawable_balance",
      ],
    ],
    raw: true,
  })) as unknown as { total_withdrawable_balance: number };

  return {
    total_profit: Number(profitResult?.total_profit || 0),
    total_deposits: Number(depositResult?.total_deposits || 0),
    total_withdrawals: Number(withdrawalResult?.total_withdrawals || 0),
    total_withdrawable_balance: Number(
      withdrawableResult?.total_withdrawable_balance || 0
    ),
  };
}
