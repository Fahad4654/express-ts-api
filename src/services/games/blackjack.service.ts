type Suit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
type Rank =
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

type Card = { suit: Suit; rank: Rank; hidden?: boolean };
type GameState = "playerTurn" | "gameOver";

export interface BJSession {
  deck: Card[];
  player: Card[];
  dealer: Card[];
  betAmount: number;
  state: GameState;
  timeout?: NodeJS.Timeout;
  cheatMode?: boolean;
}

const sessions = new Map<string, BJSession>();

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

function value(rank: Rank) {
  if (rank === "A") return 11;
  if (["K", "Q", "J"].includes(rank)) return 10;
  return Number(rank);
}

export function score(hand: Card[]) {
  let total = 0,
    aces = 0;
  for (const c of hand) {
    total += value(c.rank);
    if (c.rank === "A") aces++;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

function draw(deck: Card[]): Card {
  return deck.pop()!;
}

// ⏰ refresh session timer
function refreshSessionTimer(userId: string, s: BJSession) {
  if (s.timeout) clearTimeout(s.timeout);
  s.timeout = setTimeout(() => {
    sessions.delete(userId);
    console.log(`Session for ${userId} expired after 5 minutes`);
  }, 5 * 60 * 1000);
}

// --- Deal ---
export function bjDeal(userId: string, betAmount: number, cheatMode = false) {
  if (sessions.has(userId))
    throw new Error("You already have an active session.");

  const deck = freshDeck();
  const player = [draw(deck), draw(deck)];
  let dealer: Card[];

  if (cheatMode) {
    // Make dealer likely to win
    const playerScore = score(player);
    const dealerCards = deck.filter((c) => value(c.rank) + 10 >= playerScore); // simple cheat
    dealer = [
      dealerCards.length ? dealerCards[0] : draw(deck),
      { ...draw(deck), hidden: true },
    ];
  } else {
    dealer = [draw(deck), { ...draw(deck), hidden: true }];
  }

  const session: BJSession = {
    deck,
    player,
    dealer,
    betAmount,
    state: "playerTurn",
    cheatMode,
  };

  sessions.set(userId, session);
  refreshSessionTimer(userId, session);

  return serialize(userId);
}

// --- Hit ---
export function bjHit(userId: string, cheatMode = false) {
  const s = sessions.get(userId);
  if (!s) throw new Error("No blackjack session");
  if (s.state !== "playerTurn") throw new Error("Not player's turn");

  s.player.push(draw(s.deck));
  refreshSessionTimer(userId, s);

  if (score(s.player) >= 21) return bjStand(userId, cheatMode);
  return serialize(userId);
}

// --- Stand ---
export function bjStand(userId: string, cheatMode = false) {
  const s = sessions.get(userId);
  if (!s) throw new Error("No blackjack session");

  s.state = "gameOver";

  // Reveal dealer card
  s.dealer = s.dealer.map((c, i) => (i === 1 ? { ...c, hidden: false } : c));

  if (cheatMode) {
    // Dealer plays to beat player
    while (score(s.dealer) <= score(s.player) && score(s.dealer) < 21) {
      s.dealer.push(draw(s.deck));
    }
  } else {
    while (score(s.dealer) < 17) s.dealer.push(draw(s.deck));
  }

  const ps = score(s.player);
  const ds = score(s.dealer);

  let winner: "Player" | "Dealer" | "Push" | null = null;
  let winAmount = 0;

  if (ps > 21) winner = "Dealer";
  else if (ds > 21) {
    winner = "Player";
    winAmount = s.betAmount * 2;
  } else if (ps > ds) {
    winner = "Player";
    winAmount = s.betAmount * 2;
  } else if (ps < ds) winner = "Dealer";
  else {
    winner = "Push";
    winAmount = s.betAmount;
  }

  if (s.timeout) clearTimeout(s.timeout);
  sessions.delete(userId);

  return {
    playerHand: s.player,
    dealerHand: s.dealer,
    playerScore: ps,
    dealerScore: ds,
    gameState: "gameOver",
    winner,
    winAmount,
  };
}

// --- Serialize ---
function serialize(userId: string) {
  const s = sessions.get(userId)!;
  const ps = score(s.player);
  const ds = score(s.dealer.filter((c) => !c.hidden));

  return {
    playerHand: s.player,
    dealerHand: s.dealer,
    playerScore: ps,
    dealerScore: ds,
    gameState: s.state,
    winner: null,
    winAmount: 0,
  };
}
