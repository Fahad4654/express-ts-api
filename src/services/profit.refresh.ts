import { Profit } from "../models/Profit";
import { getDashboardStats } from "./dashboard.service";

/**
 * Refresh the Profit table by creating it if missing
 */
export async function refreshProfit() {
  const stats = await getDashboardStats();

  const defaults: Partial<Profit> = {
    total_deposits: stats.total_deposits,
    total_withdrawals: stats.total_withdrawals,
    total_withdrawable_balance: stats.total_withdrawable_balance,
    total_profit: stats.total_profit,
  };

  const [row] = await Profit.findOrCreate({ where: {}, defaults });
  await row.update(defaults);
}

/**
 * Increment the Profit totals by deltas
 */
export async function incrementProfit(updates: Partial<Profit>) {
  const profit = await Profit.findOne();
  if (!profit) return null;

  await profit.increment(updates);
  return profit.reload();
}

export async function updateProfit(updates: Partial<Profit>) {
  const profit = await Profit.findOne();
  if (!profit) return null;

  const allowedFields: Array<keyof Profit> = ["expecting_profit"];
  const filteredUpdates: Partial<Profit> = {};

  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  if (Object.keys(filteredUpdates).length === 0) return profit;

  await profit.update(filteredUpdates);

  return profit.reload();
}
