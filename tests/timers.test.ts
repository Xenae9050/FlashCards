import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "../src/hooks/useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval", "Date", "performance"] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("decreases remainingMs correctly over time", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() =>
      useCountdown({ durationMs: 5000, paused: false, onExpire }),
    );
    const initial = result.current.remainingMs;
    expect(initial).toBeGreaterThan(4900);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.remainingMs).toBeLessThanOrEqual(3000);
    expect(result.current.remainingMs).toBeGreaterThan(2500);
  });

  it("fires onExpire exactly once", () => {
    const onExpire = vi.fn();
    renderHook(() =>
      useCountdown({ durationMs: 1000, paused: false, onExpire }),
    );

    act(() => {
      vi.advanceTimersByTime(1500);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("pausing then resuming after a delay leaves the same remaining time it had at pause", () => {
    const onExpire = vi.fn();
    const { result, rerender } = renderHook(
      ({ paused }) => useCountdown({ durationMs: 5000, paused, onExpire }),
      { initialProps: { paused: false } },
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    const remainingBeforePause = result.current.remainingMs;

    rerender({ paused: true });
    const remainingAtPause = result.current.remainingMs;

    act(() => {
      vi.advanceTimersByTime(3000); // time passes while paused
    });
    expect(result.current.remainingMs).toBeCloseTo(remainingAtPause, -1);

    rerender({ paused: false });
    // The corrected deadline is only reflected once the next 100ms interval tick fires
    // (the hook's own re-render mechanism) — advance past that tick before asserting.
    act(() => {
      vi.advanceTimersByTime(100);
    });
    // Immediately after resuming, remaining should be ~ what it was at pause, not reset/drained.
    expect(result.current.remainingMs).toBeLessThanOrEqual(
      remainingBeforePause + 200,
    );
    expect(result.current.remainingMs).toBeGreaterThan(
      remainingBeforePause - 200,
    );
  });
});
