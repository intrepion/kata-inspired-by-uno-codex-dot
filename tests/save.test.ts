import { it, expect } from "vitest";
import { newMatch, act } from "../src/engine";
import { decode, encode } from "../src/save";
it("resumes a drawn choice and rejects corrupted pack identities", () => {
  let s = newMatch(2);
  s = act(s, 0, { type: "draw" });
  expect(decode(encode(s))).toEqual(s);
  const bad = structuredClone(s);
  bad.deck[0] = bad.deck[1];
  expect(decode(JSON.stringify(bad))).toBeNull();
  expect(decode("{")).toBeNull();
  expect(decode(JSON.stringify({ ...s, version: 2 }))).toBeNull();
});
it("rejects mixed numeric/string IDs duplicating a canonical identity", () => {
  const s = newMatch(3);
  const bad = JSON.parse(encode(s));
  bad.deck[0] = { ...bad.deck[1], id: String(bad.deck[1].id) };
  expect(decode(JSON.stringify(bad))).toBeNull();
});
it("rejects a nonwild top discard with a different active spectrum", () => {
  const s = newMatch(3);
  s.active = s.active === "mint" ? "gold" : "mint";
  expect(decode(encode(s))).toBeNull();
});
