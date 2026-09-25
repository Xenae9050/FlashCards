import { useEffect } from "react";
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
};

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
              <span className="font-medium">
                {summary.coinsEarnedThisRun}
              </span>
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
