type BetType = "low" | "high" | "exact";

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollDice(
  betAmount: number,
  betType: BetType,
  numDice: number,
  cheatMode = false
) {
  let results: number[];

  const minTotal = numDice * 1;
  const maxTotal = numDice * 6;
  const midTotal = (minTotal + maxTotal) / 2;
  const exactVal = Math.round(midTotal);
  if (cheatMode) {
    // 🎯 Rig dice against the player
    if (betType === "low") {
      // Player bets low → push results above midpoint
      const highMin = exactVal + 1;
      const total = Math.floor(
        Math.random() * (maxTotal - highMin + 1) + highMin
      );
      results = forceDiceResult(total, numDice);
    } else if (betType === "high") {
      // Player bets high → push results below midpoint
      const lowMax = exactVal - 1;
      const total = Math.floor(
        Math.random() * (lowMax - minTotal + 1) + minTotal
      );
      results = forceDiceResult(total, numDice);
    } else {
      // Player bets exact → almost never hit exact
      let total: number;
      do {
        total =
          Math.floor(Math.random() * (maxTotal - minTotal + 1)) + minTotal;
      } while (total === exactVal); // avoid exact match
      results = forceDiceResult(total, numDice);
    }
  } else {
    // 🎲 Normal random rolls
    results = Array.from({ length: numDice }, () => rollDie());
  }

  const total = results.reduce((a, b) => a + b, 0);

  let isWin = false;
  let multiplier = 0;

  if (betType === "exact") {
    isWin = total === exactVal;
    multiplier = 5;
  } else if (betType === "low") {
    isWin = total < exactVal;
    multiplier = 1;
  } else if (betType === "high") {
    isWin = total > exactVal;
    multiplier = 1;
  }

  const winAmount = isWin ? betAmount * multiplier : 0;

  return { results, total, isWin, winAmount };
}

// 🔧 Helper to construct dice results that sum to target total
function forceDiceResult(total: number, numDice: number): number[] {
  const results = Array(numDice).fill(1);
  let remaining = total - numDice;

  let i = 0;
  while (remaining > 0) {
    const add = Math.min(5, remaining); // max we can add to a die
    results[i] += add;
    remaining -= add;
    i = (i + 1) % numDice;
  }

  return results;
}
