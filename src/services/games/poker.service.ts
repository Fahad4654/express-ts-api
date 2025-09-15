// --- Poker Engine with Sessions (Blackjack-style) ---

export type Suit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export type Card = { suit: Suit; rank: Rank; hidden?: boolean };
export type PokerState = "draw" | "showdown";

export interface PokerSession {
  deck: Card[];
  player: Card[];
  dealer: Card[];
  betAmount: number;
  state: PokerState;
  cheatMode: boolean;
  timeout?: NodeJS.Timeout;
}

const sessions = new Map<string, PokerSession>();

// --- Deck helpers ---
function freshDeck(): Card[] {
  const suits: Suit[] = ["Hearts", "Diamonds", "Clubs", "Spades"];
  const ranks: Rank[] = [
    "A",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
  ];
  const deck: Card[] = [];
  for (const s of suits) for (const r of ranks) deck.push({ suit: s, rank: r });
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function draw(deck: Card[]): Card {
  return deck.pop()!;
}

// --- Hand evaluation ---
function evaluateHand(hand: Card[]): {
  rank: number;
  name: string;
  values: number[];
} {
  const rankOrder: Rank[] = [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ];
  const valueOf = (r: Rank) => rankOrder.indexOf(r);

  const values = hand.map((c) => valueOf(c.rank)).sort((a, b) => b - a);
  const suits = hand.map((c) => c.suit);

  const counts: Record<number, number> = {};
  for (const v of values) counts[v] = (counts[v] ?? 0) + 1;

  const isFlush = suits.every((s) => s === suits[0]);
  const isStraight =
    values.every((v, i, arr) => i === 0 || arr[i - 1] === v + 1) ||
    JSON.stringify(values) === JSON.stringify([12, 3, 2, 1, 0]); // A-2-3-4-5

  const groups = Object.entries(counts)
    .map(([v, c]) => ({ value: +v, count: c }))
    .sort((a, b) => b.count - a.count || b.value - a.value);

  if (isStraight && isFlush && values[0] === 12)
    return { rank: 10, name: "Royal Flush", values };
  if (isStraight && isFlush) return { rank: 9, name: "Straight Flush", values };
  if (groups[0].count === 4)
    return {
      rank: 8,
      name: "Four of a Kind",
      values: [groups[0].value, groups[1].value],
    };
  if (groups[0].count === 3 && groups[1].count === 2)
    return {
      rank: 7,
      name: "Full House",
      values: [groups[0].value, groups[1].value],
    };
  if (isFlush) return { rank: 6, name: "Flush", values };
  if (isStraight) return { rank: 5, name: "Straight", values };
  if (groups[0].count === 3)
    return {
      rank: 4,
      name: "Three of a Kind",
      values: [groups[0].value, ...values.filter((v) => v !== groups[0].value)],
    };
  if (groups[0].count === 2 && groups[1].count === 2)
    return {
      rank: 3,
      name: "Two Pair",
      values: [groups[0].value, groups[1].value, groups[2].value],
    };
  if (groups[0].count === 2)
    return {
      rank: 2,
      name: "One Pair",
      values: [groups[0].value, ...values.filter((v) => v !== groups[0].value)],
    };
  return { rank: 1, name: "High Card", values };
}

function compareHands(h1: Card[], h2: Card[]): "Player" | "Dealer" | "Push" {
  const e1 = evaluateHand(h1);
  const e2 = evaluateHand(h2);

  if (e1.rank > e2.rank) return "Player";
  if (e1.rank < e2.rank) return "Dealer";

  for (let i = 0; i < Math.max(e1.values.length, e2.values.length); i++) {
    if ((e1.values[i] ?? -1) > (e2.values[i] ?? -1)) return "Player";
    if ((e1.values[i] ?? -1) < (e2.values[i] ?? -1)) return "Dealer";
  }
  return "Push";
}

// --- Session timeout ---
function refreshSessionTimer(userId: string, s: PokerSession) {
  if (s.timeout) clearTimeout(s.timeout);
  s.timeout = setTimeout(() => {
    if (sessions.has(userId)) {
      sessions.delete(userId);
      console.log(`Poker session for ${userId} expired after 5 minutes`);
    }
  }, 5 * 60 * 1000);
}

// --- Game flow ---
export function pokerDeal(
  userId: string,
  betAmount: number,
  cheatMode = false
) {
  if (sessions.has(userId))
    throw new Error("You already have an active poker session");

  const deck = freshDeck();
  const player = [draw(deck), draw(deck), draw(deck), draw(deck), draw(deck)];
  const dealer = [draw(deck), draw(deck), draw(deck), draw(deck), draw(deck)];

  const s: PokerSession = {
    deck,
    player,
    dealer,
    betAmount,
    state: "draw",
    cheatMode,
  };
  sessions.set(userId, s);

  refreshSessionTimer(userId, s);

  return {
    gameId: userId,
    gameState: s.state,
    playerHand: s.player,
    dealerHand: dealer.map((c) => ({ ...c, hidden: true })),
  };
}

export function pokerDraw(userId: string, holdIndices: number[]) {
  const s = sessions.get(userId);
  if (!s) throw new Error("No poker session");
  if (s.state !== "draw") throw new Error("Not in draw state");

  const holds = new Set(holdIndices);
  s.player = s.player.map((c, i) => (holds.has(i) ? c : draw(s.deck)));
  s.state = "showdown";

  let dealerEval = evaluateHand(s.dealer);
  let playerEval = evaluateHand(s.player);
  let winner = compareHands(s.player, s.dealer);

  // --- Cheat Mode ---
  if (s.cheatMode && winner === "Player") {
    // Slightly improve dealer hand until it beats player
    let attempts = 0;
    while (compareHands(s.player, s.dealer) === "Player" && attempts < 100) {
      const deckCopy = [...s.deck];
      s.dealer = s.dealer.map((c, i) =>
        Math.random() < 0.5 ? c : draw(deckCopy)
      );
      dealerEval = evaluateHand(s.dealer);
      winner = compareHands(s.player, s.dealer);
      attempts++;
    }
  }

  let winAmount = 0;
  if (winner === "Player") winAmount = s.betAmount * 2;
  else if (winner === "Push") winAmount = s.betAmount;

  if (s.timeout) clearTimeout(s.timeout);
  sessions.delete(userId);

  return {
    gameId: userId,
    gameState: "showdown",
    playerHand: { cards: s.player, rank: playerEval.name },
    dealerHand: { cards: s.dealer, rank: dealerEval.name },
    winner,
    winAmount,
  };
}
