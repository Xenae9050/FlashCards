import { useFocusOnMount } from "../../hooks/useFocusOnMount";
import { useAppState } from "../../state/AppStateContext";
import { computeBucketKey } from "../../domain/bucketKey";
import type { Mode, Configuration } from "../../domain/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";

const MODES: { mode: Mode; title: string; description: string }[] = [
  {
    mode: "sudden-death",
    title: "Sudden Death",
    description:
      "As many questions right in a row as possible. One wrong answer ends the run.",
  },
  {
    mode: "race",
    title: "Race",
    description:
      "As many correct answers as possible before the overall clock runs out.",
  },
  {
    mode: "quickdraw",
    title: "Quickdraw",
    description: "3 lives, a short timer per question — quick thinking wins.",
  },
  {
    mode: "test",
    title: "Test",
    description:
      "A set number of questions with no timer. Answer them all, then get a grade and a review.",
  },
];

export function ModeSelectionScreen() {
  const { state, dispatch } = useAppState();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const lastConfigurations = state.saveData?.lastConfigurations;
  const buckets = state.saveData?.highScores.buckets ?? {};

  function bestFor(mode: Mode): string {
    if (mode === "test") return "Graded A+ to F";
    const last = lastConfigurations?.[mode];
    if (!last) return "No plays yet";
    const key = computeBucketKey(last as Configuration);
    const entries = buckets[key];
    if (!entries || entries.length === 0) return "No plays yet";
    return `Best: ${entries[0].points} pts`;
  }

  return (
    <main className="screen mode-selection-screen mx-auto max-w-2xl p-6">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
        Choose a Mode
      </h1>
      <div className="mode-cards mt-4 flex flex-col gap-3 sm:flex-row">
        {MODES.map(({ mode, title, description }) => (
          <button
            key={mode}
            className="mode-card flex-1 text-left"
            onClick={() => dispatch({ type: "SELECT_MODE", mode })}
          >
            <Card className="h-full transition-colors hover:border-primary/60 hover:ring-primary/20">
              <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mode-best text-sm font-medium text-muted-foreground">
                  {bestFor(mode)}
                </p>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
      <div className="screen-actions mt-6">
        <Button
          variant="outline"
          onClick={() =>
            dispatch({ type: "NAVIGATE", screen: "pool-selection" })
          }
        >
          Back
        </Button>
      </div>
    </main>
  );
}
