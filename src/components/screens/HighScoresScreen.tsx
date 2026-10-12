import { useMemo } from "react";
import { useFocusOnMount } from "../../hooks/useFocusOnMount";
import { useAppState } from "../../state/AppStateContext";
import { formatConfigurationLabel } from "../../domain/bucketKey";
import type { Mode, HighScoreEntry } from "../../domain/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";

const MODES: Mode[] = ["sudden-death", "race", "quickdraw"];
const MODE_LABEL: Record<Mode, string> = {
  "sudden-death": "Sudden Death",
  race: "Race",
  quickdraw: "Quickdraw",
  test: "Test",
};

export function HighScoresScreen() {
  const { state, dispatch } = useAppState();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const buckets = state.saveData?.highScores.buckets ?? {};
  const poolNamesById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const pool of state.poolCatalog?.pools ?? [])
      map[pool.id] = pool.poolName;
    return map;
  }, [state.poolCatalog]);

  const byMode = useMemo(() => {
    const result: Record<Mode, { key: string; entries: HighScoreEntry[] }[]> = {
      "sudden-death": [],
      race: [],
      quickdraw: [],
      test: [],
    };
    for (const [key, entries] of Object.entries(buckets)) {
      const mode = key.split("|")[0] as Mode;
      result[mode]?.push({ key, entries });
    }
    for (const mode of MODES) {
      result[mode].sort((a, b) => {
        const aMax = Math.max(
          ...a.entries.map((e) => new Date(e.achievedAt).getTime()),
        );
        const bMax = Math.max(
          ...b.entries.map((e) => new Date(e.achievedAt).getTime()),
        );
        return bMax - aMax;
      });
    }
    return result;
  }, [buckets]);

  return (
    <main className="screen high-scores-screen mx-auto max-w-2xl p-6">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
        High Scores
      </h1>
      <Tabs defaultValue={MODES[0]} className="mt-4">
        <TabsList className="w-full">
          {MODES.map((mode) => (
            <TabsTrigger key={mode} value={mode} className="flex-1">
              {MODE_LABEL[mode]}
            </TabsTrigger>
          ))}
        </TabsList>
        {MODES.map((mode) => (
          <TabsContent
            key={mode}
            value={mode}
            className="mt-4 flex flex-col gap-4"
          >
            {byMode[mode].length === 0 && (
              <p className="text-sm text-muted-foreground">
                No high scores yet.
              </p>
            )}
            {byMode[mode].map(({ key, entries }) => (
              <Card key={key} className="high-score-bucket">
                <CardHeader>
                  <CardTitle className="text-sm">
                    {formatConfigurationLabel(
                      entries[0].configuration,
                      poolNamesById,
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ol className="flex flex-col gap-1 text-sm">
                    {entries.map((entry, i) => (
                      <li key={i} className="flex justify-between">
                        <span className="font-medium">
                          #{i + 1} — {entry.points} pts
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(entry.achievedAt).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
      <div className="screen-actions mt-6 flex gap-2">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: "RESET_HIGH_SCORES" })}
        >
          Reset High Scores
        </Button>
        <Button
          variant="ghost"
          onClick={() => dispatch({ type: "NAVIGATE", screen: "main-menu" })}
        >
          Back
        </Button>
      </div>
    </main>
  );
}
