type BetType = "low" | "high" | "exact";

function rollDie(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export function rollDice(betAmount: number, betType: BetType, numDice: number) {
  // Roll the dice
  const results = Array.from({ length: numDice }, () => rollDie());
  const total = results.reduce((a, b) => a + b, 0);

  let isWin = false;
  let multiplier = 0;

  const minTotal = numDice * 1;
  const maxTotal = numDice * 6;
  const midTotal = (minTotal + maxTotal) / 2;

  // Internal "exact" value logic: only the **middle total** counts as exact
  // For odd number of dice, round to nearest integer
  const exactVal = Math.round(midTotal);

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
