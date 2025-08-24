const symbols = ["cherry", "bell", "clover", "diamond", "star", "seven"];
const payouts: Record<string, number> = {
  cherry: 5,
  bell: 10,
  clover: 20,
  diamond: 50,
  star: 100,
  seven: 250,
};

function shuffleReel(): string[] {
  return [...symbols].sort(() => Math.random() - 0.5);
}

export function spinSlot(betAmount: number) {
  const reels = [shuffleReel(), shuffleReel(), shuffleReel()];
  const result = reels.map((r) => r[0]);
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
