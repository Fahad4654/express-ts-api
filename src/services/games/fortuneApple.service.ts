type FAState = "playing" | "gameOver";

interface FASession {
  betAmount: number;
  currentLevel: number;
  state: FAState;
  bank: number; // last cashed (or 0)
}

const sessions = new Map<string, FASession>();

// simple multipliers (example): level 1 -> 1.2x, 2 -> 1.5x, ... up to 10 -> 50x
const multipliers = [1.2, 1.5, 2, 3, 5, 8, 12, 20, 30, 50];

function badAppleCount(level: number) {
  if (level <= 3) return 1;
  if (level <= 6) return 2;
  if (level <= 9) return 3;
  return 4;
}

export function faStart(userId: string, betAmount: number) {
  sessions.set(userId, { betAmount, currentLevel: 1, state: "playing", bank: 0 });
  return {
    gameId: userId,
    gameState: "playing",
    currentLevel: 1,
    nextWinAmount: Math.floor(betAmount * multipliers[0]),
  };
}

export function faPick(userId: string, level: number, appleIndex: number) {
  const s = sessions.get(userId);
  if (!s || s.state !== "playing" || s.currentLevel !== level) {
    throw new Error("Invalid game state");
  }

  const apples = 5;
  const badCount = badAppleCount(level);
  const badSet = new Set<number>();
  while (badSet.size < badCount) badSet.add(Math.floor(Math.random()*apples));

  const isBad = badSet.has(appleIndex);
  if (isBad) {
    s.state = "gameOver";
    return {
      gameId: userId,
      gameState: "gameOver",
      pickResult: "bad",
      finalWinAmount: 0,
      lastLevelOutcome: { level, pickedIndex: appleIndex, badAppleIndices: [...badSet] },
    };
  }

  // good pick -> advance
  s.bank = Math.floor(s.betAmount * multipliers[level - 1]);
  s.currentLevel++;

  if (s.currentLevel > 10) {
    s.state = "gameOver";
    return {
      gameId: userId,
      gameState: "gameOver",
      pickResult: "good",
      finalWinAmount: Math.floor(s.betAmount * multipliers[9]),
      lastLevelOutcome: { level, pickedIndex: appleIndex, badAppleIndices: [...badSet] },
    };
  }

  return {
    gameId: userId,
    gameState: "playing",
    pickResult: "good",
    currentLevel: s.currentLevel,
    nextWinAmount: Math.floor(s.betAmount * multipliers[s.currentLevel - 1]),
    lastLevelOutcome: { level, pickedIndex: appleIndex, badAppleIndices: [...badSet] },
  };
}

export function faCashout(userId: string) {
  const s = sessions.get(userId);
  if (!s) throw new Error("No fortune apple session");
  s.state = "gameOver";
  return {
    gameId: userId,
    gameState: "gameOver",
    finalWinAmount: s.bank,
  };
}
