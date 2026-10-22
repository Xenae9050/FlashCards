import { useCallback, useEffect, useRef, useState } from "react";
import { useAppState } from "../../state/AppStateContext";
import { endReasonForCurrentAnswer } from "../../state/appReducer";
import { useCountdown } from "../../hooks/useCountdown";
import { TopStatusBar } from "../gameplay/TopStatusBar";
import { AnswerGrid } from "../gameplay/AnswerGrid";
import { RevealPanel } from "../gameplay/RevealPanel";
import { PauseOverlay } from "../gameplay/PauseOverlay";
import { Button } from "../ui/button";
import {
  READY_COUNTDOWN_MS,
  MIN_VIEW_TIME_MS,
  AUTO_ADVANCE_DELAY_MS,
} from "../../domain/constants";

function PreCountdownOverlay({ onDone }: { onDone: () => void }) {
  const [tick, setTick] = useState(3);
  useEffect(() => {
    if (tick <= 0) {
      onDone();
      return;
    }
    const t = setTimeout(() => setTick((v) => v - 1), READY_COUNTDOWN_MS / 3);
    return () => clearTimeout(t);
  }, [tick, onDone]);
  return (
    <div
      className="flex min-h-[50vh] items-center justify-center"
      aria-live="polite"
    >
      <h1 className="text-6xl font-bold">{tick > 0 ? tick : "Go!"}</h1>
    </div>
  );
}

function ActiveQuestion({
  raceRemainingMs,
}: {
  raceRemainingMs: number | null;
}) {
  const { state, dispatch } = useAppState();
  const run = state.run!;
  const question = run.currentDeckQuestion!.question;
  const mode = run.config.mode;
  // When this answer ends the run, the player must click Continue themselves (no auto-advance)
  // so they can take as long as they need to read the correction.
  const endsRun =
    endReasonForCurrentAnswer(run) !== null ||
    run.deckPointer >= run.deck.length;
  // Per-question countdown (Sudden Death / Quickdraw only). Duration is computed relative to
  // the absolute questionShownAt timestamp (which RESUME shifts forward by the paused duration),
  // so a pause/resume-triggered remount always reproduces the correct remaining time.
  const hasPerQuestionTimer = mode === "sudden-death" || mode === "quickdraw";
  const questionDurationMs = Math.max(
    0,
    (run.questionShownAt ?? performance.now()) +
      run.config.modeSettingSeconds * 1000 -
      performance.now(),
  );
  const onQuestionExpire = () => {
    if (!run.revealVisible) dispatch({ type: "QUESTION_TIMER_EXPIRED" });
  };
  const { remainingMs: questionRemainingMs } = useCountdown({
    durationMs: questionDurationMs,
    paused: run.isPaused || run.revealVisible || !hasPerQuestionTimer,
    onExpire: onQuestionExpire,
  });

  // Min-view-time and auto-advance timers, started the instant Reveal appears. Delays are
  // computed relative to revealShownAt (also shifted by RESUME) for the same reason as above.
  useEffect(() => {
    if (!run.revealVisible || run.isPaused || run.revealShownAt === null)
      return;
    const elapsedSinceReveal = performance.now() - run.revealShownAt;
    const minViewDelay = Math.max(
      0,
      MIN_VIEW_TIME_MS[mode] - elapsedSinceReveal,
    );
    const autoAdvanceDelay = Math.max(
      0,
      AUTO_ADVANCE_DELAY_MS[mode] - elapsedSinceReveal,
    );
    const minViewTimer = setTimeout(
      () => dispatch({ type: "MIN_VIEW_TIME_ELAPSED" }),
      minViewDelay,
    );
    const autoAdvanceTimer = endsRun
      ? null
      : setTimeout(() => dispatch({ type: "CONTINUE" }), autoAdvanceDelay);
    return () => {
      clearTimeout(minViewTimer);
      if (autoAdvanceTimer) clearTimeout(autoAdvanceTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    run.revealVisible,
    run.isPaused,
    run.deckPointer,
    endsRun,
    mode,
    dispatch,
  ]);

  const totalMs = run.config.modeSettingSeconds * 1000;
  const isRace = mode === "race";
  const barRemainingMs = isRace
    ? raceRemainingMs
    : hasPerQuestionTimer && !run.revealVisible
    ? questionRemainingMs
    : null;

  return (
    <>
      <TopStatusBar
        mode={mode}
        streak={run.streak}
        pointsTotal={run.pointsTotal}
        correctCount={run.correctCount}
        livesRemaining={run.livesRemaining}
        remainingMs={barRemainingMs}
        totalMs={barRemainingMs !== null ? totalMs : null}
        onPause={() => dispatch({ type: "PAUSE" })}
        onStopAndSave={() => dispatch({ type: "STOP_AND_SAVE" })}
        showStopAndSave={
          (mode === "sudden-death" || mode === "quickdraw") &&
          run.correctCount >= 1
        }
        questionNumber={run.deckPointer}
        questionTotal={run.deck.length}
      />
      <div className="my-4 rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-xl font-semibold">{question.prompt}</p>
        <AnswerGrid
          choices={run.shuffledChoices}
          correctChoice={question.correctChoice}
          selectedChoice={run.selectedAnswerText}
          revealVisible={run.revealVisible}
          disabled={run.revealVisible}
          onSelect={(choice) =>
            dispatch({ type: "SELECT_ANSWER", choiceText: choice })
          }
        />
        {mode === "test" && (
          <Button
            className="mt-4"
            onClick={() => dispatch({ type: "TEST_NEXT" })}
          >
            {run.deckPointer >= run.deck.length ? "Finish" : "Next"}
          </Button>
        )}
      </div>
      {run.revealVisible && (
        <RevealPanel
          question={question}
          selectedChoice={run.selectedAnswerText}
          wasCorrect={run.wasCorrect}
          canContinue={run.canContinue}
          continueLabel={endsRun ? "See results" : "Continue"}
          onContinue={() => dispatch({ type: "CONTINUE" })}
        />
      )}
    </>
  );
}

/**
 * Lives at GameplayScreen level (a sibling of the paused/hidden subtree, never unmounted by
 * pausing) per Section 8.3, and reports its remainingMs up via onTick so TopStatusBar (which
 * *is* unmounted while paused) can render Race's "Time remaining (overall)" bar per Section 7.4
 * whenever it's mounted.
 */
function RaceOverallClock({
  onTick,
}: {
  onTick: (remainingMs: number) => void;
}) {
  const { state, dispatch } = useAppState();
  const run = state.run!;
  const { remainingMs } = useCountdown({
    durationMs: run.config.modeSettingSeconds * 1000,
    paused: run.isPaused,
    onExpire: () => dispatch({ type: "OVERALL_TIMER_EXPIRED" }),
  });
  useEffect(() => {
    onTick(remainingMs);
  }, [remainingMs, onTick]);
  return null;
}

export function GameplayScreen() {
  const { state, dispatch } = useAppState();
  const run = state.run;
  const headingRef = useRef<HTMLDivElement>(null);
  const [raceRemainingMs, setRaceRemainingMs] = useState<number | null>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const handleRaceTick = useCallback((remainingMs: number) => {
    setRaceRemainingMs(remainingMs);
  }, []);

  if (!run) return null;

  return (
    <main
      className="screen gameplay-screen mx-auto max-w-2xl p-6"
      ref={headingRef}
      tabIndex={-1}
    >
      {run.config.mode === "race" && !run.preCountdownActive && (
        <RaceOverallClock onTick={handleRaceTick} />
      )}
      {run.preCountdownActive ? (
        <PreCountdownOverlay
          onDone={() => dispatch({ type: "BEGIN_FIRST_QUESTION" })}
        />
      ) : run.isPaused ? (
        <PauseOverlay
          onResume={() => dispatch({ type: "RESUME" })}
          onRestart={() => dispatch({ type: "RESTART_RUN" })}
          onChangeSettings={() => dispatch({ type: "CHANGE_SETTINGS" })}
          onQuit={() => dispatch({ type: "QUIT_TO_MAIN_MENU" })}
        />
      ) : (
        <ActiveQuestion
          key={`${run.runId}-${run.deckPointer}`}
          raceRemainingMs={raceRemainingMs}
        />
      )}
    </main>
  );
}
