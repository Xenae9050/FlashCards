import { Pause, Square, Heart } from "lucide-react";
import type { Mode } from "../../domain/types";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface Props {
  mode: Mode;
  streak: number;
  pointsTotal: number;
  correctCount: number;
  livesRemaining: number;
  remainingMs: number | null; // per-question or overall, mode-dependent; null hides the clock
  totalMs: number | null; // duration remainingMs is counting down from, used for the bar's fill
  onPause: () => void;
  onStopAndSave: () => void;
  showStopAndSave: boolean;
}

/**
 * A depleting progress bar communicates "time running out" more viscerally than a plain number,
 * so the countdown is rendered purely visually (as spec'd, it must never be an aria-live region —
 * see Section 15.2 — ticking updates would spam screen-reader users every 100ms).
 */
function TimeBar({
  remainingMs,
  totalMs,
}: {
  remainingMs: number;
  totalMs: number;
}) {
  const pct = totalMs > 0 ? Math.max(0, Math.min(100, (remainingMs / totalMs) * 100)) : 0;
  const critical = pct <= 25;
  return (
    <div className="flex min-w-[7rem] flex-1 items-center gap-2 sm:flex-none sm:basis-40">
      <Progress
        value={pct}
        aria-hidden="true"
        className="h-2.5"
        indicatorClassName={critical ? "bg-destructive" : "bg-primary"}
      />
    </div>
  );
}

export function TopStatusBar({
  mode,
  streak,
  pointsTotal,
  correctCount,
  livesRemaining,
  remainingMs,
  totalMs,
  onPause,
  onStopAndSave,
  showStopAndSave,
}: Props) {
  const showBar = remainingMs !== null && totalMs !== null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-3 py-2 text-card-foreground sm:gap-4">
      {mode === "sudden-death" && (
        <>
          <Badge variant="secondary">Streak: {streak}</Badge>
          <Badge variant="secondary">Points: {pointsTotal}</Badge>
        </>
      )}
      {mode === "race" && (
        <>
          <Badge variant="secondary">Correct: {correctCount}</Badge>
          <Badge variant="secondary">Points: {pointsTotal}</Badge>
        </>
      )}
      {mode === "quickdraw" && (
        <>
          <span
            className="flex items-center gap-0.5"
            aria-label={`${livesRemaining} lives remaining`}
          >
            {Array.from({ length: livesRemaining }).map((_, i) => (
              <Heart
                key={i}
                className="size-4 fill-destructive text-destructive"
              />
            ))}
          </span>
          <Badge variant="secondary">Correct: {correctCount}</Badge>
          <Badge variant="secondary">Points: {pointsTotal}</Badge>
        </>
      )}
      {showBar && <TimeBar remainingMs={remainingMs} totalMs={totalMs} />}
      <div className="ml-auto flex gap-2">
        {showStopAndSave && (
          <Button variant="outline" size="sm" onClick={onStopAndSave}>
            <Square className="size-3.5" /> Stop &amp; Save
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onPause}>
          <Pause className="size-3.5" /> Pause
        </Button>
      </div>
    </div>
  );
}
