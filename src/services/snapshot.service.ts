// src/services/snapshot.service.ts
import { Profit } from "../models/Profit";
import { ProfitSnapshot } from "../models/ProfitSnapshot";
import { refreshProfit } from "./profit.refresh";

export async function takeProfitSnapshot() {
  // Ensure latest profit values
  await refreshProfit();

  const profit = await Profit.findOne();
  if (!profit) throw new Error("Profit row not found");

  // Save snapshot
  return await ProfitSnapshot.create({
    total_deposits: profit.total_deposits,
    total_withdrawals: profit.total_withdrawals,
    total_withdrawable_balance: profit.total_withdrawable_balance,
    total_profit: profit.total_profit,
    expecting_profit: profit.expecting_profit,
  });
}
