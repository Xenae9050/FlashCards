import { useMemo, useState } from "react";
import { AlertTriangle, ChevronDown } from "lucide-react";
import { useFocusOnMount } from "../../hooks/useFocusOnMount";
import { useAppState } from "../../state/AppStateContext";
import type { Difficulty } from "../../domain/types";
import { MIN_RECOMMENDED_QUESTIONS } from "../../domain/constants";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export function PoolSelectionScreen() {
  const { state, dispatch } = useAppState();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const [errorsExpanded, setErrorsExpanded] = useState(false);

  const pools = state.poolCatalog?.pools ?? [];
  const errors = state.poolCatalog?.errors ?? [];
  const { selectedPoolIds, difficultyFilter } = state.poolSelection;

  const grouped = useMemo(() => {
    const groups: Record<string, typeof pools> = {};
    for (const pool of pools) {
      const category = pool.category ?? "General";
      (groups[category] ??= []).push(pool);
    }
    return groups;
  }, [pools]);

  const filteredQuestionCount = useMemo(() => {
    const selectedPools = pools.filter((p) => selectedPoolIds.includes(p.id));
    return selectedPools
      .flatMap((p) => p.questions)
      .filter((q) => difficultyFilter.includes(q.difficulty ?? "Medium"))
      .length;
  }, [pools, selectedPoolIds, difficultyFilter]);

  const canContinue = selectedPoolIds.length > 0 && filteredQuestionCount > 0;

  if (pools.length === 0) {
    return (
      <main className="screen pool-selection-screen mx-auto max-w-2xl p-6">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
          Choose Question Pools
        </h1>
        <Alert variant="destructive" className="mt-4" role="alert">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            No valid question pools were found. Add a pool file to{" "}
            <code>public/pools/</code> and restart the app.
          </AlertDescription>
        </Alert>
        <Button
          className="mt-4"
          onClick={() => dispatch({ type: "NAVIGATE", screen: "main-menu" })}
        >
          Back
        </Button>
      </main>
    );
  }

  return (
    <main className="screen pool-selection-screen mx-auto max-w-2xl p-6">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
        Choose Question Pools
      </h1>

      {errors.length > 0 && (
        <div className="pool-errors-notice mt-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setErrorsExpanded((v) => !v)}
          >
            <ChevronDown className="size-4" /> {errors.length} pool file(s)
            could not be loaded
          </Button>
          {errorsExpanded && (
            <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
              {errors.map((e, i) => (
                <li key={i}>
                  {e.fileName}: {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="pool-bulk-actions mt-4 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: "SELECT_ALL_POOLS" })}
        >
          Select All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => dispatch({ type: "CLEAR_ALL_POOLS" })}
        >
          Clear All
        </Button>
      </div>

      {Object.entries(grouped).map(([category, categoryPools]) => (
        <fieldset key={category} className="mt-4">
          <legend className="mb-2 text-sm font-semibold text-muted-foreground">
            {category}
          </legend>
          <div className="flex flex-col gap-2">
            {categoryPools.map((pool) => (
              <Label
                key={pool.id}
                className="pool-row flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-card p-3 font-normal"
              >
                <Checkbox
                  className="mt-0.5"
                  checked={selectedPoolIds.includes(pool.id)}
                  onCheckedChange={() =>
                    dispatch({ type: "TOGGLE_POOL_SELECTED", poolId: pool.id })
                  }
                />
                <span className="flex flex-1 flex-col">
                  <span className="pool-name font-medium">
                    {pool.poolName}
                  </span>
                  {pool.description && (
                    <span className="pool-description text-sm text-muted-foreground">
                      {pool.description}
                    </span>
                  )}
                  <span className="pool-count text-xs text-muted-foreground">
                    {pool.questions.length} questions
                  </span>
                </span>
              </Label>
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset className="mt-4">
        <legend className="mb-2 text-sm font-semibold text-muted-foreground">
          Difficulty
        </legend>
        <div className="flex flex-wrap gap-4">
          {DIFFICULTIES.map((difficulty) => (
            <Label
              key={difficulty}
              className="flex cursor-pointer items-center gap-2 font-normal"
            >
              <Checkbox
                checked={difficultyFilter.includes(difficulty)}
                onCheckedChange={(checked) =>
                  dispatch({
                    type: "SET_DIFFICULTY_FILTER",
                    difficulty,
                    enabled: checked === true,
                  })
                }
              />
              {difficulty}
            </Label>
          ))}
        </div>
      </fieldset>

      <Separator className="my-4" />

      <p className="question-count-preview text-sm text-muted-foreground">
        {filteredQuestionCount} question(s) available
      </p>

      {filteredQuestionCount > 0 &&
        filteredQuestionCount < MIN_RECOMMENDED_QUESTIONS && (
          <Alert className="warning mt-3">
            <AlertTriangle className="size-4" />
            <AlertDescription>
              This selection has fewer than {MIN_RECOMMENDED_QUESTIONS}{" "}
              questions — your run may end early via Pool Exhausted.
            </AlertDescription>
          </Alert>
        )}
      {selectedPoolIds.length > 0 && filteredQuestionCount === 0 && (
        <Alert variant="destructive" className="warning mt-3" role="alert">
          <AlertTriangle className="size-4" />
          <AlertDescription>
            Your difficulty filter excludes every question in the selected
            pool(s). Adjust your selection to continue.
          </AlertDescription>
        </Alert>
      )}

      <div className="screen-actions mt-6 flex gap-2">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: "NAVIGATE", screen: "main-menu" })}
        >
          Back
        </Button>
        <Button
          disabled={!canContinue}
          onClick={() => dispatch({ type: "CONFIRM_POOL_SELECTION" })}
        >
          Continue
        </Button>
      </div>
    </main>
  );
}
