// minimal poker engine just to scaffold endpoints
export type Suit = "Hearts" | "Diamonds" | "Clubs" | "Spades";
export type Rank = "2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"J"|"Q"|"K"|"A";
export type Card = { suit: Suit; rank: Rank };
export type PokerState = "draw" | "showdown";

const sessions = new Map<string, {
  deck: Card[];
  player: Card[];
  dealer: Card[];
  state: PokerState;
  betAmount: number;
}>();

// build and shuffle a deck
function deck(): Card[] {
  const suits: Suit[] = ["Hearts","Diamonds","Clubs","Spades"];
  const ranks: Rank[] = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const d: Card[] = [];
  for (const s of suits) for (const r of ranks) d.push({ suit: s, rank: r });
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [d[i], d[j]] = [d[j], d[i]];
  }
  return d;
}
function draw(d: Card[]) { return d.pop()!; }

// --- Poker evaluation helpers ---
function evaluateHand(hand: Card[]): { rank: number; name: string; values: number[] } {
  const rankOrder: Rank[] = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];
  const valueOf = (r: Rank) => rankOrder.indexOf(r);

  const values = hand.map(c => valueOf(c.rank)).sort((a,b) => b-a);
  const suits = hand.map(c => c.suit);

  const counts: Record<number, number> = {};
  for (const v of values) counts[v] = (counts[v] ?? 0) + 1;

  const isFlush = suits.every(s => s === suits[0]);
  const isStraight = values.every((v,i,arr) => i===0 || arr[i-1] === v+1) 
                  || JSON.stringify(values) === JSON.stringify([12,3,2,1,0]); // A-2-3-4-5

  const groups = Object.entries(counts).map(([v,c]) => ({value: +v, count: c}))
                   .sort((a,b) => b.count - a.count || b.value - a.value);

  if (isStraight && isFlush && values[0] === 12) return { rank: 10, name: "Royal Flush", values };
  if (isStraight && isFlush) return { rank: 9, name: "Straight Flush", values };
  if (groups[0].count === 4) return { rank: 8, name: "Four of a Kind", values: [groups[0].value, groups[1].value] };
  if (groups[0].count === 3 && groups[1].count === 2) return { rank: 7, name: "Full House", values: [groups[0].value, groups[1].value] };
  if (isFlush) return { rank: 6, name: "Flush", values };
  if (isStraight) return { rank: 5, name: "Straight", values };
  if (groups[0].count === 3) return { rank: 4, name: "Three of a Kind", values: [groups[0].value, ...values.filter(v=>v!==groups[0].value)] };
  if (groups[0].count === 2 && groups[1].count === 2) return { rank: 3, name: "Two Pair", values: [groups[0].value, groups[1].value, groups[2].value] };
  if (groups[0].count === 2) return { rank: 2, name: "One Pair", values: [groups[0].value, ...values.filter(v=>v!==groups[0].value)] };
  return { rank: 1, name: "High Card", values };
}

function compareHands(h1: Card[], h2: Card[]) {
  const e1 = evaluateHand(h1);
  const e2 = evaluateHand(h2);

  if (e1.rank > e2.rank) return "Player";
  if (e1.rank < e2.rank) return "Dealer";

  for (let i=0; i<Math.max(e1.values.length, e2.values.length); i++) {
    if ((e1.values[i] ?? -1) > (e2.values[i] ?? -1)) return "Player";
    if ((e1.values[i] ?? -1) < (e2.values[i] ?? -1)) return "Dealer";
  }
  return "Push";
}

// --- Deal new game ---
export function pokerDeal(userId: string, betAmount: number) {
  const d = deck();
  const player = [draw(d), draw(d), draw(d), draw(d), draw(d)];
  const dealer = [draw(d), draw(d), draw(d), draw(d), draw(d)];

  sessions.set(userId, { deck: d, player, dealer, state: "draw", betAmount });
  return { gameId: userId, gameState: "draw", playerHand: player, dealerHand: dealer.map(_ => ({..._, hidden: true})) };
}

// --- Draw step ---
export function pokerDraw(userId: string, holdIndices: number[]) {
  const s = sessions.get(userId);
  if (!s) throw new Error("No poker session");
  if (s.state !== "draw") throw new Error("Not in draw state");

  const holds = new Set(holdIndices);
  s.player = s.player.map((c, i) => holds.has(i) ? c : draw(s.deck));
  s.state = "showdown";

  const playerEval = evaluateHand(s.player);
  const dealerEval = evaluateHand(s.dealer);
  const winner = compareHands(s.player, s.dealer);

  const winAmount = winner === "Player" ? s.betAmount * 2 : (winner === "Push" ? s.betAmount : 0);

  return {
    gameId: userId,
    gameState: "showdown",
    playerHand: { cards: s.player, rank: playerEval.name },
    dealerHand: { cards: s.dealer, rank: dealerEval.name },
    winner,
    winAmount
  };
}
