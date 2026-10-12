import { it, expect, vi, afterEach } from "vitest";
import { TurnClock } from "../src/lifecycle";
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it("reset and rescheduling suppress stale delayed actions", () => {
  vi.useFakeTimers();
  const clock = new TurnClock(),
    fn = vi.fn();
  clock.schedule(fn);
  clock.cancel();
  vi.runAllTimers();
  expect(fn).not.toHaveBeenCalled();
  clock.schedule(fn);
  clock.schedule(fn);
  vi.runAllTimers();
  expect(fn).toHaveBeenCalledTimes(1);
});
it("generation guard rejects a callback already queued before cancellation", () => {
  vi.useFakeTimers();
  const clock = new TurnClock(),
    callback = vi.fn();
  vi.stubGlobal("clearTimeout", () => {});
  clock.schedule(callback);
  clock.cancel();
  vi.runAllTimers();
  expect(callback).not.toHaveBeenCalled();
});
