// ---------------- Fortune Apple ----------------

type FAState = "playing" | "gameOver";

export interface FASession {
  betAmount: number;
  currentLevel: number;
  state: FAState;
  bank: number; // last cashed (or 0)
  timeout?: NodeJS.Timeout; // ⏰ auto-expire
  cheatMode: boolean; // ⚡ cheat flag
}

const sessions = new Map<string, FASession>();

// simple multipliers (example): level 1 -> 1.2x, ... level 10 -> 50x
const multipliers = [1.2, 1.5, 2, 3, 5, 8, 12, 20, 30, 50];

function badAppleCount(level: number) {
  if (level <= 3) return 1;
  if (level <= 6) return 2;
  if (level <= 9) return 3;
  return 4;
}

// ⏰ refresh session timeout helper
function refreshSessionTimer(userId: string, s: FASession) {
  if (s.timeout) clearTimeout(s.timeout);
  s.timeout = setTimeout(() => {
    if (sessions.has(userId)) {
      sessions.delete(userId);
      console.log(
        `🍎 Fortune Apple session for ${userId} expired after 5 minutes`
      );
    }
  }, 5 * 60 * 1000);
}

export function faStart(userId: string, betAmount: number, cheatMode = false) {
  if (sessions.has(userId)) {
    throw new Error("You already have an active FA session.");
  }

  const s: FASession = {
    betAmount,
    currentLevel: 1,
    state: "playing",
    bank: 0,
    cheatMode,
  };

  sessions.set(userId, s);
  refreshSessionTimer(userId, s);

  return {
    gameId: userId,
    gameState: "playing" as FAState,
    currentLevel: 1,
    nextWinAmount: Math.floor(betAmount * multipliers[0]),
  };
}

export function faPick(userId: string, level: number, appleIndex: number) {
  const s = sessions.get(userId);
  if (!s || s.state !== "playing" || s.currentLevel !== level) {
    throw new Error("Invalid game state");
  }

  refreshSessionTimer(userId, s);

  const apples = 5;
  const badCount = badAppleCount(level);
  const badSet = new Set<number>();

  if (s.cheatMode) {
    // 🎯 In cheat mode, bias against player:
    // 50% chance the chosen apple is forced to be bad
    const forceBad = Math.random() < 0.5;
    while (badSet.size < badCount)
      badSet.add(Math.floor(Math.random() * apples));
    if (forceBad) badSet.add(appleIndex); // ensure the pick is bad
  } else {
    // 🎲 Normal fair play
    while (badSet.size < badCount)
      badSet.add(Math.floor(Math.random() * apples));
  }

  const isBad = badSet.has(appleIndex);
  if (isBad) {
    s.state = "gameOver";
    if (s.timeout) clearTimeout(s.timeout);
    sessions.delete(userId);

    return {
      gameId: userId,
      gameState: "gameOver" as FAState,
      pickResult: "bad",
      finalWinAmount: 0,
      lastLevelOutcome: {
        level,
        pickedIndex: appleIndex,
        badAppleIndices: [...badSet],
      },
    };
  }

  // ✅ good pick -> advance
  s.bank = Math.floor(s.betAmount * multipliers[level - 1]);
  s.currentLevel++;

  if (s.currentLevel > 10) {
    s.state = "gameOver";
    if (s.timeout) clearTimeout(s.timeout);
    sessions.delete(userId);

    return {
      gameId: userId,
      gameState: "gameOver" as FAState,
      pickResult: "good",
      finalWinAmount: Math.floor(s.betAmount * multipliers[9]),
      lastLevelOutcome: {
        level,
        pickedIndex: appleIndex,
        badAppleIndices: [...badSet],
      },
    };
  }

  return {
    gameId: userId,
    gameState: "playing" as FAState,
    pickResult: "good",
    currentLevel: s.currentLevel,
    nextWinAmount: Math.floor(s.betAmount * multipliers[s.currentLevel - 1]),
    lastLevelOutcome: {
      level,
      pickedIndex: appleIndex,
      badAppleIndices: [...badSet],
    },
  };
}

export function faCashout(userId: string) {
  const s = sessions.get(userId);
  if (!s) throw new Error("No fortune apple session");

  s.state = "gameOver";
  if (s.timeout) clearTimeout(s.timeout);
  sessions.delete(userId);

  return {
    gameId: userId,
    gameState: "gameOver" as FAState,
    finalWinAmount: s.bank,
  };
}
