import { describe, it, expect } from "vitest";
import {
  act,
  makeDeck,
  newMatch,
  legalCards,
  cardsIn,
  aiTurn,
  aiView,
  chooseAI,
  type Card,
  type State,
} from "../src/engine";
import { decode, encode } from "../src/save";
const pack = makeDeck();
const find = (
  spectrum: Card["spectrum"],
  kind: Card["kind"],
  value = 0,
  copy = 0,
) =>
  pack.filter(
    (c) => c.spectrum === spectrum && c.kind === kind && c.value === value,
  )[copy];
const n = (s: Card["spectrum"], v: number) => find(s, "number", v);
function rig(
  hand: Card[],
  top = n("coral", 7),
  other: Card[][] = [[n("gold", 3)], [n("mint", 5)]],
): State {
  const s = newMatch(77);
  s.hands = [hand, ...other];
  s.discard = [top];
  const ids = new Set([...s.hands.flat(), top].map((c) => c.id));
  s.deck = pack.filter((c) => !ids.has(c.id));
  s.active = top.spectrum ?? "coral";
  s.current = 0;
  s.phase = "turn";
  s.declared = false;
  s.drawn = null;
  return s;
}
function conserved(s: State) {
  expect(cardsIn(s)).toHaveLength(108);
  expect(new Set(cardsIn(s).map((c) => c.id)).size).toBe(108);
}
describe("documented rule semantics", () => {
  it("matches spectrum, number and action symbol independently", () => {
    let s = rig([
      n("azure", 7),
      n("coral", 2),
      n("gold", 2),
      find(null, "wild"),
    ]);
    expect(legalCards(s)).toEqual([
      n("azure", 7).id,
      n("coral", 2).id,
      find(null, "wild").id,
    ]);
    s = rig(
      [find("azure", "skip"), find("gold", "reverse")],
      find("coral", "skip"),
    );
    expect(legalCards(s)).toEqual([find("azure", "skip").id]);
  });
  it("strictly rejects wild draw four with matching spectrum but permits symbol matches", () => {
    const wild = find(null, "draw4");
    let s = rig([wild, n("coral", 2)]);
    expect(legalCards(s)).not.toContain(wild.id);
    expect(act(s, 0, { type: "play", id: wild.id, spectrum: "mint" })).toBe(s);
    s = rig([wild, n("azure", 7)]);
    expect(legalCards(s)).toContain(wild.id);
  });
  it("resolves draw two immediately, skips the victim and does not stack", () => {
    const c = find("coral", "draw2");
    const s = rig([c, n("azure", 8)], undefined, [
      [find("gold", "draw2")],
      [n("mint", 5)],
    ]);
    s.declared = true;
    const next = act(s, 0, { type: "play", id: c.id });
    expect(next.hands[1]).toHaveLength(3);
    expect(next.current).toBe(2);
    expect(act(next, 1, { type: "play", id: next.hands[1][0].id })).toBe(next);
    conserved(next);
  });
  it("reverse changes three-seat order, skip jumps over the next seat", () => {
    for (const kind of ["reverse", "skip"] as const) {
      const c = find("coral", kind);
      const s = rig([c, n("azure", 8)]);
      s.declared = true;
      const next = act(s, 0, { type: "play", id: c.id });
      expect(next.current).toBe(2);
      expect(next.direction).toBe(kind === "reverse" ? -1 : 1);
    }
  });
  it("reverse and skip work in counterclockwise direction", () => {
    const c = find("coral", "skip"),
      s = rig([c, n("azure", 8)]);
    s.direction = -1;
    s.declared = true;
    const next = act(s, 0, { type: "play", id: c.id });
    expect(next.current).toBe(1);
  });
  it("permits voluntary draw, only drawn card may play, and passing advances", () => {
    const s = rig([n("coral", 2), n("azure", 8), n("mint", 8)]);
    const drawn = n("coral", 1);
    s.deck = s.deck.filter((c) => c.id !== drawn.id);
    s.deck.push(drawn);
    const next = act(s, 0, { type: "draw" });
    expect(next.phase).toBe("drawn");
    expect(legalCards(next)).toEqual([drawn.id]);
    expect(act(next, 0, { type: "draw" })).toBe(next);
    expect(act(next, 0, { type: "play", id: n("coral", 2).id })).toBe(next);
    expect(act(next, 0, { type: "pass" }).current).toBe(1);
    conserved(next);
  });
  it("unplayable draw advances without another click", () => {
    const s = rig([n("coral", 2), n("azure", 8)]),
      drawn = n("gold", 9);
    s.deck = s.deck.filter((c) => c.id !== drawn.id);
    s.deck.push(drawn);
    const next = act(s, 0, { type: "draw" });
    expect(next.current).toBe(1);
    expect(next.phase).toBe("turn");
  });
  it("wild selection is atomic; missing or invalid selection leaves state unchanged", () => {
    const c = find(null, "wild"),
      s = rig([c, n("azure", 8), n("mint", 8)]);
    expect(act(s, 0, { type: "play", id: c.id })).toBe(s);
    const next = act(s, 0, { type: "play", id: c.id, spectrum: "gold" });
    expect(next.active).toBe("gold");
    expect(next.discard.at(-1)?.id).toBe(c.id);
    conserved(next);
  });
  it("missing Relay adds two; arming avoids penalty; drawing disarms", () => {
    const c = n("coral", 2),
      s = rig([c, n("azure", 8)]);
    expect(act(s, 0, { type: "play", id: c.id }).hands[0]).toHaveLength(3);
    const declared = act(s, 0, { type: "declare" });
    expect(act(declared, 0, { type: "play", id: c.id }).hands[0]).toHaveLength(
      1,
    );
    expect(act(declared, 0, { type: "draw" }).declared).toBe(false);
    expect(decode(encode(declared))).toEqual(declared);
  });
  it("finishes on draw four, resolves penalty before points and detects match win", () => {
    const c = find(null, "draw4"),
      s = rig([c]);
    s.scores[0] = 249;
    const next = act(s, 0, { type: "play", id: c.id, spectrum: "mint" });
    expect(next.hands[1]).toHaveLength(5);
    expect(next.winner).toBe(0);
    expect(next.phase).toBe("match");
    expect(next.award).toBe(
      next.hands
        .slice(1)
        .flat()
        .reduce(
          (sum, c) =>
            sum + (c.kind === "number" ? c.value : c.spectrum ? 20 : 50),
          0,
        ),
    );
    expect(act(next, next.current, { type: "draw" })).toBe(next);
    conserved(next);
  });
  it("number, skip, reverse and wild can finish", () => {
    for (const c of [
      n("coral", 2),
      find("coral", "skip"),
      find("coral", "reverse"),
      find(null, "wild"),
    ]) {
      const s = rig([c]);
      expect(
        act(s, 0, { type: "play", id: c.id, spectrum: "mint" }).winner,
      ).toBe(0);
    }
  });
  it("recycles discard except top and preserves active wild spectrum", () => {
    const top = find(null, "wild"),
      s = rig([n("coral", 2), n("azure", 8)], top);
    s.active = "gold";
    s.discard = [...s.deck, top];
    s.deck = [];
    const next = act(s, 0, { type: "draw" });
    expect(next.discard).toEqual([top]);
    expect(next.active).toBe("gold");
    conserved(next);
  });
  it("short penalties draw only available cards without losing the top", () => {
    const c = find("coral", "draw2"),
      s = rig([c, n("azure", 8)]);
    s.declared = true;
    s.hands[2].push(...s.deck);
    s.deck = [];
    const next = act(s, 0, { type: "play", id: c.id });
    expect(next.hands[1]).toHaveLength(2);
    expect(next.discard).toEqual([c]);
    expect(next.current).toBe(2);
    conserved(next);
  });
  it("three empty supply passes end blocked round without awarding points", () => {
    let s = rig([n("azure", 8)]);
    s.hands[1].push(...s.deck);
    s.deck = [];
    for (let i = 0; i < 3; i++) s = act(s, s.current, { type: "draw" });
    expect(s.phase).toBe("round");
    expect(s.winner).toBeNull();
    expect(s.scores).toEqual([0, 0, 0]);
    conserved(s);
    expect(decode(encode(s))).toEqual(s);
  });
  it("next deal retains score, rotates lead and rejects next during a turn", () => {
    let s = rig([n("coral", 2)]);
    expect(act(s, 0, { type: "next" })).toBe(s);
    s = act(s, 0, { type: "play", id: n("coral", 2).id });
    const score = [...s.scores];
    s = act(s, s.current, { type: "next" });
    expect(s.round).toBe(2);
    expect(s.current).toBe(1);
    expect(s.scores).toEqual(score);
    conserved(s);
  });
  it("seeded simulations finish 100 matches with conservation and save validity after every turn", () => {
    let wins = [0, 0, 0],
      actions = 0;
    for (let seed = 1; seed <= 100; seed++) {
      let s = newMatch(seed);
      for (let i = 0; i < 20000 && s.phase !== "match"; i++) {
        s =
          s.phase === "round" ? act(s, s.current, { type: "next" }) : aiTurn(s);
        conserved(s);
        expect(decode(encode(s))).toEqual(s);
        actions++;
      }
      expect(s.phase).toBe("match");
      wins[s.winner!]++;
    }
    expect(wins.every((x) => x > 0)).toBe(true);
    expect(actions).toBeGreaterThan(10000);
  }, 30000);
  it("AI decision is invariant under concealed-hand/deck changes with same public counts", () => {
    const s = newMatch(13),
      v = aiView(s),
      a = chooseAI(v);
    const other = structuredClone(s);
    const first = other.hands[1][0];
    other.hands[1][0] = other.deck[0];
    other.deck[0] = first;
    other.seed = 12345;
    other.deck.reverse();
    expect(chooseAI(aiView(other))).toEqual(a);
    expect(v.hand).toEqual(s.hands[s.current]);
    expect("hands" in v).toBe(false);
  });
});
