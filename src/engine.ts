export const spectra = ["coral", "gold", "mint", "azure"] as const;
export type Spectrum = (typeof spectra)[number];
export type Kind = "number" | "skip" | "reverse" | "draw2" | "wild" | "draw4";
export type Card = {
  id: number;
  spectrum: Spectrum | null;
  kind: Kind;
  value: number;
};
export type Phase = "turn" | "drawn" | "round" | "match";
export type State = {
  version: 1;
  seed: number;
  hands: Card[][];
  deck: Card[];
  discard: Card[];
  active: Spectrum;
  current: number;
  direction: 1 | -1;
  phase: Phase;
  drawn: number | null;
  declared: boolean;
  scores: number[];
  round: number;
  winner: number | null;
  award: number;
  blocked: number;
  revision: number;
  log: string[];
};
export type Action =
  | { type: "play"; id: number; spectrum?: Spectrum }
  | { type: "draw" | "pass" | "declare" | "next" };
export const names = ["You", "Mira", "Sol"];
export function makeDeck(): Card[] {
  const deck: Card[] = [];
  const add = (spectrum: Spectrum | null, kind: Kind, value = 0) =>
    deck.push({ id: deck.length, spectrum, kind, value });
  for (const spectrum of spectra) {
    add(spectrum, "number");
    for (let n = 1; n <= 9; n++) {
      add(spectrum, "number", n);
      add(spectrum, "number", n);
    }
    for (const kind of ["skip", "reverse", "draw2"] as const) {
      add(spectrum, kind);
      add(spectrum, kind);
    }
  }
  for (let i = 0; i < 4; i++) {
    add(null, "wild");
    add(null, "draw4");
  }
  return deck;
}
function random(s: State) {
  s.seed = (Math.imul(s.seed, 1664525) + 1013904223) >>> 0;
  return s.seed / 4294967296;
}
function shuffle(s: State, cards: Card[]) {
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(random(s) * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}
function note(s: State, text: string) {
  s.log = [...s.log.slice(-7), text];
}
export function points(c: Card) {
  return c.kind === "number" ? c.value : c.spectrum ? 20 : 50;
}
export function cardsIn(s: State) {
  return [...s.deck, ...s.discard, ...s.hands.flat()];
}
export function newMatch(seed = Date.now() >>> 0): State {
  const s: State = {
    version: 1,
    seed,
    hands: [[], [], []],
    deck: [],
    discard: [],
    active: "coral",
    current: 0,
    direction: 1,
    phase: "turn",
    drawn: null,
    declared: false,
    scores: [0, 0, 0],
    round: 0,
    winner: null,
    award: 0,
    blocked: 0,
    revision: 0,
    log: [],
  };
  deal(s);
  return s;
}
function deal(s: State) {
  s.round++;
  s.deck = shuffle(s, makeDeck());
  s.hands = [[], [], []];
  for (let i = 0; i < 7; i++) for (const h of s.hands) h.push(s.deck.pop()!);
  const opening = s.deck.findIndex((c) => c.kind === "number");
  s.discard = [s.deck.splice(opening, 1)[0]];
  s.active = s.discard[0].spectrum!;
  s.current = (s.round - 1) % 3;
  s.direction = 1;
  s.phase = "turn";
  s.drawn = null;
  s.declared = false;
  s.winner = null;
  s.award = 0;
  s.blocked = 0;
  note(s, `Round ${s.round}. ${names[s.current]} lead.`);
}
function take(s: State, seat: number, count: number) {
  const taken: Card[] = [];
  for (let i = 0; i < count; i++) {
    if (!s.deck.length && s.discard.length > 1) {
      const top = s.discard.pop()!;
      s.deck = shuffle(s, s.discard);
      s.discard = [top];
      note(s, "The discard pile is recycled.");
    }
    const card = s.deck.pop();
    if (!card) break;
    s.hands[seat].push(card);
    taken.push(card);
  }
  return taken;
}
export function legalCards(s: State): number[] {
  if (s.phase !== "turn" && s.phase !== "drawn") return [];
  const h = s.hands[s.current],
    top = s.discard.at(-1)!;
  return h
    .filter(
      (c) =>
        (s.phase !== "drawn" || c.id === s.drawn) &&
        (c.kind === "wild" ||
          (c.kind === "draw4" && !h.some((x) => x.spectrum === s.active)) ||
          c.spectrum === s.active ||
          (c.spectrum !== null &&
            c.kind === top.kind &&
            (c.kind !== "number" || c.value === top.value))),
    )
    .map((c) => c.id);
}
function advance(s: State, steps = 1) {
  s.current = (s.current + s.direction * steps + 6) % 3;
  s.phase = "turn";
  s.drawn = null;
  s.declared = false;
}
export function act(state: State, actor: number, action: Action): State {
  if (actor !== state.current) return state;
  if (action.type === "next") {
    if (state.phase !== "round") return state;
    const s = structuredClone(state);
    deal(s);
    s.revision++;
    return s;
  }
  if (state.phase !== "turn" && state.phase !== "drawn") return state;
  if (action.type === "declare") {
    if (state.hands[actor].length !== 2 || state.declared) return state;
    const s = structuredClone(state);
    s.declared = true;
    s.revision++;
    note(s, `${names[actor]} ${actor === 0 ? "call" : "calls"} Relay!`);
    return s;
  }
  if (action.type === "pass" && state.phase !== "drawn") return state;
  if (action.type === "draw" && state.phase !== "turn") return state;
  if (
    action.type === "play" &&
    (!legalCards(state).includes(action.id) ||
      (state.hands[actor].find((c) => c.id === action.id)!.spectrum === null &&
        !spectra.includes(action.spectrum!)))
  )
    return state;
  const s = structuredClone(state);
  s.revision++;
  if (action.type === "draw") {
    s.declared = false;
    const drawn = take(s, actor, 1);
    s.drawn = drawn[0]?.id ?? null;
    s.phase = "drawn";
    note(
      s,
      `${names[actor]} ${actor === 0 ? "draw" : "draws"} ${drawn.length ? "a card" : "from an empty supply; pass"}.`,
    );
    if (drawn.length) {
      s.blocked = 0;
      if (!legalCards(s).length) advance(s);
    } else {
      s.blocked++;
      advance(s);
      if (s.blocked >= 3) {
        s.phase = "round";
        note(s, "Table blocked. No points this round.");
      }
    }
    return s;
  }
  if (action.type === "pass") {
    note(s, `${names[actor]} ${actor === 0 ? "pass" : "passes"}.`);
    advance(s);
    return s;
  }
  if (action.type !== "play") return state;
  const hand = s.hands[actor],
    index = hand.findIndex((c) => c.id === action.id),
    card = hand.splice(index, 1)[0];
  s.discard.push(card);
  s.active = card.spectrum ?? action.spectrum!;
  s.blocked = 0;
  note(
    s,
    `${names[actor]} ${actor === 0 ? "play" : "plays"} ${cardLabel(card)}${!card.spectrum ? ` → ${s.active}` : ""}.`,
  );
  if (hand.length === 1 && !s.declared) {
    take(s, actor, 2);
    note(s, `${names[actor]} missed Relay! Two-card penalty.`);
  }
  if (card.kind === "reverse") s.direction = s.direction === 1 ? -1 : 1;
  const next = (actor + s.direction + 3) % 3;
  const penalty = card.kind === "draw2" ? 2 : card.kind === "draw4" ? 4 : 0;
  if (penalty) {
    const got = take(s, next, penalty);
    note(
      s,
      `${names[next]} ${next === 0 ? "draw" : "draws"} ${got.length} and ${next === 0 ? "miss" : "misses"} a turn.`,
    );
  }
  if (card.kind === "skip")
    note(s, `${names[next]} ${next === 0 ? "are" : "is"} skipped.`);
  const finished = hand.length === 0;
  advance(s, penalty || card.kind === "skip" ? 2 : 1);
  if (finished) {
    s.winner = actor;
    s.award = s.hands.reduce(
      (sum, h, i) =>
        sum + (i === actor ? 0 : h.reduce((n, c) => n + points(c), 0)),
      0,
    );
    s.scores[actor] += s.award;
    s.phase = s.scores[actor] >= 250 ? "match" : "round";
    note(
      s,
      `${names[actor]} ${actor === 0 ? "win" : "wins"} ${s.award} points!`,
    );
  }
  return s;
}
export const symbols: Record<Kind, string> = {
  number: "",
  skip: "⊘",
  reverse: "⇄",
  draw2: "+2",
  wild: "✦",
  draw4: "✦+4",
};
export function cardLabel(c: Card) {
  return `${c.spectrum ?? "prism"} ${c.kind === "number" ? c.value : { skip: "Skip", reverse: "Reverse", draw2: "Draw Two", wild: "Wild", draw4: "Wild Draw Four" }[c.kind]}`;
}
export type AIView = {
  hand: Card[];
  top: Card;
  active: Spectrum;
  counts: number[];
  direction: 1 | -1;
  legal: number[];
  phase: Phase;
};
export function aiView(s: State): AIView {
  return {
    hand: structuredClone(s.hands[s.current]),
    top: { ...s.discard.at(-1)! },
    active: s.active,
    counts: s.hands.map((h) => h.length),
    direction: s.direction,
    legal: legalCards(s),
    phase: s.phase,
  };
}
export function chooseAI(v: AIView): Action {
  const choices = v.hand
    .filter((c) => v.legal.includes(c.id))
    .sort(
      (a, b) =>
        points(b) +
          (b.spectrum ? 15 : 0) -
          (points(a) + (a.spectrum ? 15 : 0)) || a.id - b.id,
    );
  if (!choices.length) return { type: v.phase === "drawn" ? "pass" : "draw" };
  const c = choices[0];
  const spectrum = [...spectra].sort(
    (a, b) =>
      v.hand.filter((x) => x.id !== c.id && x.spectrum === b).length -
      v.hand.filter((x) => x.id !== c.id && x.spectrum === a).length,
  )[0];
  return { type: "play", id: c.id, ...(!c.spectrum ? { spectrum } : {}) };
}
export function aiTurn(s: State) {
  let current = s;
  if (s.hands[s.current].length === 2 && !s.declared)
    current = act(s, s.current, { type: "declare" });
  return act(current, current.current, chooseAI(aiView(current)));
}
