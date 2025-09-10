import { Profit } from "../models/Profit";
import { getDashboardStats } from "./dashboard.service";

export async function refreshProfit() {
  try {
    // Get totals
    const stats = await getDashboardStats();

    // Cast stats to Partial<Profit> to satisfy Sequelize typing
    const defaults: Partial<Profit> = {
      total_deposits: stats.total_deposits,
      total_withdrawals: stats.total_withdrawals,
      total_withdrawable_balance: stats.total_withdrawable_balance,
      total_profit: stats.total_profit,
    };

    // Update or create the single row
    const [row] = await Profit.findOrCreate({
      where: {}, // only one row
      defaults,
    });

    await row.update(defaults);
  } catch (error) {
    console.error("Error updating profit table:", error);
  }
}
