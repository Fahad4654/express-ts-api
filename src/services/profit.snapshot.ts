import { Profit } from "../models/Profit";
import { ProfitSnapshot } from "../models/ProfitSnapshot";

export async function createMonthlySnapshot(periodStart: Date, periodEnd: Date) {
  const profit = await Profit.findOne();
  if (!profit) return null;

  return ProfitSnapshot.create({
    period_start: periodStart,
    period_end: periodEnd,
    total_profit: profit.total_profit,
    total_deposits: profit.total_deposits,
    total_withdrawals: profit.total_withdrawals,
    total_withdrawable_balance: profit.total_withdrawable_balance,
  });
}
