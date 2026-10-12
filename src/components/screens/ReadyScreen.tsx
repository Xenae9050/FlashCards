import { useFocusOnMount } from "../../hooks/useFocusOnMount";
import { useAppState } from "../../state/AppStateContext";
import type { Mode, Configuration } from "../../domain/types";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export function ReadyScreen() {
  const { state, dispatch } = useAppState();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const config = state.pendingConfiguration as Partial<Configuration>;
  const mode = config.mode as Mode | undefined;
  const pools = state.poolCatalog?.pools ?? [];
  const poolNames = (config.selectedPoolIds ?? [])
    .map((id) => pools.find((p) => p.id === id)?.poolName ?? id)
    .join(", ");

  return (
    <main className="screen ready-screen mx-auto max-w-md p-6">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
        Ready?
      </h1>
      <Card className="mt-4">
        <CardContent>
          <ul className="ready-recap flex flex-col gap-2 text-sm">
            <li className="flex justify-between">
              <span className="text-muted-foreground">Mode</span>
              <span className="font-medium capitalize">{mode}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">Setting</span>
              <span className="font-medium">{config.modeSettingSeconds}
                {mode === "test" ? " questions" : "s"}
              </span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-muted-foreground">Pools</span>
              <span className="text-right font-medium">{poolNames}</span>
            </li>
            <li className="flex justify-between gap-4">
              <span className="text-muted-foreground">Difficulty</span>
              <span className="text-right font-medium">
                {(config.difficultyFilter ?? []).join(", ")}
              </span>
            </li>
          </ul>
        </CardContent>
      </Card>
      <div className="screen-actions mt-6 flex gap-2">
        <Button
          variant="outline"
          onClick={() =>
            dispatch({ type: "NAVIGATE", screen: "mode-configuration" })
          }
        >
          Back
        </Button>
        <Button onClick={() => dispatch({ type: "START_RUN" })}>Start</Button>
      </div>
    </main>
  );
}
