import { useEffect, useReducer, useRef } from "react";

interface UseCountdownOptions {
  durationMs: number;
  paused: boolean;
  onExpire: () => void;
}

interface UseCountdownResult {
  remainingMs: number;
  isExpired: boolean;
}

export function useCountdown({
  durationMs,
  paused,
  onExpire,
}: UseCountdownOptions): UseCountdownResult {
  const deadlineRef = useRef<number>(performance.now() + durationMs);
  const remainingAtPauseRef = useRef<number | null>(null);
  const hasExpiredRef = useRef(false);
  const [, forceTick] = useReducer((n) => n + 1, 0);

  useEffect(() => {
    if (paused) {
      // Freeze: remember exactly how much time was left.
      remainingAtPauseRef.current = Math.max(
        0,
        deadlineRef.current - performance.now(),
      );
      return;
    }
    // Resume (or initial mount): recompute the deadline from any frozen remaining time.
    if (remainingAtPauseRef.current !== null) {
      deadlineRef.current = performance.now() + remainingAtPauseRef.current;
      remainingAtPauseRef.current = null;
    }

    const intervalId = setInterval(() => {
      const remaining = deadlineRef.current - performance.now();
      if (remaining <= 0 && !hasExpiredRef.current) {
        hasExpiredRef.current = true;
        forceTick();
        onExpire();
      } else {
        forceTick();
      }
    }, 100); // tick every 100ms purely to force a re-render; the *actual* value is always (deadline - now)

    return () => clearInterval(intervalId);
  }, [paused, onExpire]);

  const remainingMs = paused
    ? remainingAtPauseRef.current ?? 0
    : Math.max(0, deadlineRef.current - performance.now());

  return { remainingMs, isExpired: hasExpiredRef.current };
}
