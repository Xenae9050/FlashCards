import { useEffect, useState } from "react";
import { Coins, Award, Trophy } from "lucide-react";
import { useFocusOnMount } from "../../hooks/useFocusOnMount";
import { useAppState } from "../../state/AppStateContext";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Separator } from "../ui/separator";

const END_REASON_LABEL: Record<string, string> = {
  mistake: "A wrong answer ended the run.",
  "lives-depleted": "You ran out of lives.",
  "clock-expired": "Time's up!",
  "pool-exhausted": "You've answered every available question — nicely done!",
  "stop-and-save": "You banked your run.",
  quit: "Run abandoned.",
  "test-complete": "Test complete.",
};

function pct(e: { correct: number; total: number }) {
  return Math.round((e.correct / e.total) * 100);
}

function TestResults() {
  const { state, dispatch } = useAppState();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const [view, setView] = useState<"none" | "incorrect" | "all">("none");
  const report = state.lastResultSummary!.testReport!;
  const poolNames = new Map(
    (state.poolCatalog?.pools ?? []).map((p) => [p.id, p.poolName]),
  );

  const toggleView = (target: "incorrect" | "all") =>
    setView((v) => (v === target ? "none" : target));

  const weak = (entries: typeof report.byPool) =>
    entries.filter((e) => e.correct < e.total && pct(e) < 80).slice(0, 5);
  const weakPools = weak(report.byPool);
  const weakTags = weak(report.byTag);
  const weakDifficulties = weak(report.byDifficulty);
  const nothingToImprove =
    weakPools.length + weakTags.length + weakDifficulties.length === 0;

  return (
    <main className="screen results-screen mx-auto max-w-2xl p-6">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
        Test Results
      </h1>
      <Card className="mt-4">
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total score</p>
            <p className="text-2xl font-semibold">
              {report.correct} / {report.total} ({report.percent}%)
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Grade</p>
            <p
              className="text-5xl font-bold"
              aria-label={`Grade ${report.grade}`}
            >
              {report.grade}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Coins className="size-4" /> Coins earned
          </span>
          <span className="font-medium">
            {state.lastResultSummary!.coinsEarnedThisRun}
          </span>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardContent>
          <h2 className="font-semibold">What to improve</h2>
          {report.incorrect.length === 0 || nothingToImprove ? (
            <p className="mt-2 text-sm text-muted-foreground">
              {report.incorrect.length === 0
                ? "Perfect score \u2014 nothing to improve!"
                : "No single topic stands out; review the questions you missed."}
            </p>
          ) : (
            <div className="mt-2 flex flex-col gap-3 text-sm">
              {weakPools.length > 0 && (
                <div>
                  <p className="text-muted-foreground">Pools</p>
                  <ul className="list-disc pl-5">
                    {weakPools.map((e) => (
                      <li key={e.label}>
                        {poolNames.get(e.label) ?? e.label}: {e.correct}/
                        {e.total} ({pct(e)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {weakTags.length > 0 && (
                <div>
                  <p className="text-muted-foreground">Topics</p>
                  <ul className="list-disc pl-5">
                    {weakTags.map((e) => (
                      <li key={e.label}>
                        {e.label}: {e.correct}/{e.total} ({pct(e)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {weakDifficulties.length > 0 && (
                <div>
                  <p className="text-muted-foreground">Difficulty</p>
                  <ul className="list-disc pl-5">
                    {weakDifficulties.map((e) => (
                      <li key={e.label}>
                        {e.label} questions: {e.correct}/{e.total} ({pct(e)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 flex flex-wrap gap-2">
        {report.incorrect.length > 0 && (
          <Button
            variant="outline"
            aria-expanded={view === "incorrect"}
            onClick={() => toggleView("incorrect")}
          >
            {view === "incorrect" ? "Hide" : "Show"} incorrect questions (
            {report.incorrect.length})
          </Button>
        )}
        {report.answers.length > 0 && (
          <Button
            variant="outline"
            aria-expanded={view === "all"}
            onClick={() => toggleView("all")}
          >
            {view === "all" ? "Hide" : "Show"} all answers (
            {report.answers.length})
          </Button>
        )}
      </div>
      {view !== "none" && (
        <ol className="mt-4 flex flex-col gap-3">
          {(view === "all" ? report.answers : report.incorrect).map((a, i) => {
            const isCorrect = a.selected === a.question.correctChoice;
            return (
              <li key={`${a.poolId}-${a.question.id}`}>
                <Card>
                  <CardContent className="flex flex-col gap-1 text-sm">
                    <p className="font-medium">
                      {i + 1}. {a.question.prompt}
                    </p>
                    {isCorrect ? (
                      <p className="text-success">
                        Your answer (correct): {a.selected}
                      </p>
                    ) : (
                      <>
                        <p className="text-destructive">
                          Your answer: {a.selected ?? "(no answer)"}
                        </p>
                        <p className="text-success">
                          Correct answer: {a.question.correctChoice}
                        </p>
                      </>
                    )}
                    {a.question.explanation && (
                      <p className="text-muted-foreground">
                        {a.question.explanation}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ol>
      )}

      <div className="screen-actions mt-6 flex flex-wrap gap-2">
        <Button onClick={() => dispatch({ type: "PLAY_AGAIN" })}>
          Retake Test
        </Button>
        <Button
          variant="outline"
          onClick={() => dispatch({ type: "ADJUST_AND_RETRY" })}
        >
          Adjust &amp; Retry
        </Button>
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: "NAVIGATE", screen: "main-menu" })}
        >
          Main Menu
        </Button>
      </div>
    </main>
  );
}

export function ResultsScreen() {
  const { state, dispatch } = useAppState();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();

  useEffect(() => {
    if (state.run && !state.run.resultsProcessed) {
      dispatch({ type: "PROCESS_RESULTS" });
    }
  }, [state.run, dispatch]);

  const summary = state.lastResultSummary;

  if (!summary) {
    return (
      <main className="screen mx-auto max-w-md p-6">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
          Results
        </h1>
        <p className="mt-4 text-muted-foreground">Calculating…</p>
      </main>
    );
  }

  if (summary.testReport) return <TestResults />;

  return (
    <main className="screen results-screen mx-auto max-w-md p-6">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
        Results
      </h1>
      <p className="mt-2 text-muted-foreground">
        {END_REASON_LABEL[summary.runEndReason] ?? ""}
      </p>
      <Card className="mt-4">
        <CardContent>
          <ul className="results-stats flex flex-col gap-2 text-sm">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Correct</span>
              <span className="font-medium">
                {summary.correctCount} / {summary.attemptedCount}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Points</span>
              <span className="font-medium">{summary.pointsTotal}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Coins className="size-4" /> Coins earned this run
              </span>
              <span className="font-medium">{summary.coinsEarnedThisRun}</span>
            </li>
            {summary.milestoneBonus > 0 && (
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Award className="size-4" /> Bonus coins
                </span>
                <span className="font-medium">{summary.milestoneBonus}</span>
              </li>
            )}
            <Separator className="my-1" />
            <li className="flex justify-between font-semibold">
              <span>Total coins this run</span>
              <span>{summary.totalCoinsThisRun}</span>
            </li>
            {summary.rank !== null && (
              <li className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Trophy className="size-4" /> Leaderboard rank
                </span>
                <span className="font-medium">#{summary.rank}</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
      <div className="screen-actions mt-6 flex flex-wrap gap-2">
        <Button onClick={() => dispatch({ type: "PLAY_AGAIN" })}>
          Play Again
        </Button>
        <Button
          variant="outline"
          onClick={() => dispatch({ type: "ADJUST_AND_RETRY" })}
        >
          Adjust &amp; Retry
        </Button>
        <Button
          variant="outline"
          onClick={() => dispatch({ type: "NAVIGATE", screen: "high-scores" })}
        >
          High Scores
        </Button>
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: "NAVIGATE", screen: "main-menu" })}
        >
          Main Menu
        </Button>
      </div>
    </main>
  );
}
