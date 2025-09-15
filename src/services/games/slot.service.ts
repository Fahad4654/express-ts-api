import { Profit } from "../../models/Profit";

const symbols = ["cherry", "bell", "clover", "diamond", "star", "seven"];
const payouts: Record<string, number> = {
  cherry: 5,
  bell: 10,
  clover: 20,
  diamond: 50,
  star: 100,
  seven: 250,
};

// Pick 3 unique symbols for the spin
function pickUniqueSymbols(): string[] {
  const available = [...symbols];
  const result: string[] = [];
  for (let i = 0; i < 3; i++) {
    const idx = Math.floor(Math.random() * available.length);
    result.push(available[idx]);
    available.splice(idx, 1);
  }
  return result;
}

// Create a reel: first symbol fixed, rest shuffled without duplicates
function createReel(firstSymbol: string): string[] {
  const remaining = symbols.filter((s) => s !== firstSymbol);
  return [firstSymbol, ...remaining.sort(() => Math.random() - 0.5)];
}

// Spin the slot machine
export async function spinSlot(betAmount: number, cheatMode = false) {
  let result: string[] = [];

  console.log(cheatMode);
  if (cheatMode) {
    // Cheat mode: force a losing combination (no three matching)
    result = pickUniqueSymbols();
  } else {
    // Normal mode: try to allow win, but check profit
    let attemptWin = Math.random() < 0.2;
    if (attemptWin) {
      const winningSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const potentialWin = betAmount * payouts[winningSymbol];

      const profit = await Profit.findOne();
      const profitAmount = profit?.expecting_profit ?? 0;
      const totalProfit = profit?.total_profit ?? 0;
      const winableAmount = totalProfit - profitAmount;
      console.log("--------", winableAmount);

      if (potentialWin > winableAmount) {
        attemptWin = false; // Cannot allow win
      } else {
        result = [winningSymbol, winningSymbol, winningSymbol];
      }
    }

    if (!attemptWin) {
      // Losing spin
      result = pickUniqueSymbols();
    }
  }

  // Create reels: first symbol matches spin result, rest shuffled
  const reels = result.map((res) => createReel(res));

  const isWin = result.every((s) => s === result[0]);
  const winningSymbol = isWin ? result[0] : null;
  const winAmount = isWin ? betAmount * payouts[winningSymbol!] : 0;

  return {
    reels,
    isWin,
    winAmount,
    winningSymbol,
  };
}
