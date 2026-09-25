import { cn } from "cn";
import { useFocusOnMount } from "../../hooks/useFocusOnMount";
import { useAppState } from "../../state/AppStateContext";
import { MODE_SETTING_RANGES, QUICKDRAW_LIVES } from "../../domain/constants";
import type { Mode } from "../../domain/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

function previewSentence(mode: Mode, seconds: number): string {
  switch (mode) {
    case "sudden-death":
      return `You'll have ${seconds} seconds to answer each question.`;
    case "race": {
      if (seconds % 60 === 0)
        return `You have ${seconds / 60} minutes in total.`;
      return `You have ${seconds} seconds in total.`;
    }
    case "quickdraw":
      return `You'll have ${seconds} seconds per question, with ${QUICKDRAW_LIVES} lives.`;
  }
}

export function ModeConfigurationScreen() {
  const { state, dispatch } = useAppState();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const mode = state.pendingConfiguration.mode as Mode | undefined;

  if (!mode) {
    return (
      <main className="screen mx-auto max-w-2xl p-6">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
          No mode selected
        </h1>
        <Button
          className="mt-4"
          onClick={() =>
            dispatch({ type: "NAVIGATE", screen: "mode-selection" })
          }
        >
          Back
        </Button>
      </main>
    );
  }

  const range = MODE_SETTING_RANGES[mode];
  const seconds =
    state.pendingConfiguration.modeSettingSeconds ?? range.defaultSeconds;
  const hasLastSettings = !!state.saveData?.lastConfigurations[mode];
  const valid = seconds >= range.min && seconds <= range.max;

  return (
    <main className="screen mode-configuration-screen mx-auto max-w-2xl p-6">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold capitalize">
        Configure {mode.replace("-", " ")}
      </h1>

      <div className="preset-chips mt-4 flex flex-wrap gap-2">
        {range.presetsSeconds.map((preset) => (
          <Button
            key={preset}
            variant={preset === seconds ? "default" : "outline"}
            size="sm"
            className={cn("chip", preset === seconds && "chip-selected")}
            onClick={() =>
              dispatch({ type: "SET_MODE_SETTING", seconds: preset })
            }
          >
            {preset}s
          </Button>
        ))}
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <Label htmlFor="custom-seconds">Custom (seconds)</Label>
        <Input
          id="custom-seconds"
          type="number"
          className="max-w-[10rem]"
          min={range.min}
          max={range.max}
          value={seconds}
          onChange={(e) => {
            const value = Number(e.target.value);
            const clamped = Math.min(
              range.max,
              Math.max(range.min, value || range.min),
            );
            dispatch({ type: "SET_MODE_SETTING", seconds: clamped });
          }}
        />
      </div>

      <p className="preview-sentence mt-4 text-sm text-muted-foreground">
        {previewSentence(mode, seconds)}
      </p>

      <Button
        variant="outline"
        className="mt-4"
        disabled={!hasLastSettings}
        onClick={() => dispatch({ type: "USE_LAST_SETTINGS" })}
      >
        Use Last Settings
      </Button>

      <div className="screen-actions mt-6 flex gap-2">
        <Button
          variant="outline"
          onClick={() =>
            dispatch({ type: "NAVIGATE", screen: "mode-selection" })
          }
        >
          Back
        </Button>
        <Button
          disabled={!valid}
          onClick={() => dispatch({ type: "CONFIRM_MODE_CONFIGURATION" })}
        >
          Continue
        </Button>
      </div>
    </main>
  );
}
