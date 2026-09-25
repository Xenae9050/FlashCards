import { useState } from "react";
import { useFocusOnMount } from "../../hooks/useFocusOnMount";
import { useAppState } from "../../state/AppStateContext";
import type { SettingsFile } from "../../domain/types";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";

const TOGGLES: { key: keyof SettingsFile; label: string }[] = [
  { key: "soundEffects", label: "Sound Effects" },
  { key: "reduceMotion", label: "Reduce Motion" },
  { key: "colourBlindFriendly", label: "Colour-blind Friendly Mode" },
  { key: "highContrast", label: "High Contrast" },
  { key: "silentMode", label: "Silent Mode" },
  { key: "answerKeyHints", label: "Answer Key Hints" },
];

export function SettingsScreen() {
  const { state, dispatch } = useAppState();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const [confirming, setConfirming] = useState<
    null | "high-scores" | "coins" | "everything"
  >(null);
  const settings = state.saveData?.settings;

  if (!settings) return null;

  function confirmAndRun(
    action:
      | "RESET_HIGH_SCORES"
      | "RESET_COINS_AND_PURCHASES"
      | "RESET_EVERYTHING",
  ) {
    dispatch({ type: action });
    setConfirming(null);
  }

  function ResetRow({
    id,
    label,
    action,
  }: {
    id: "high-scores" | "coins" | "everything";
    label: string;
    action:
      | "RESET_HIGH_SCORES"
      | "RESET_COINS_AND_PURCHASES"
      | "RESET_EVERYTHING";
  }) {
    if (confirming === id) {
      return (
        <Alert variant="destructive">
          <AlertDescription className="flex flex-col gap-2">
            <span>{label}? This cannot be undone.</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={() => confirmAndRun(action)}
              >
                Confirm
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirming(null)}
              >
                Cancel
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <Button variant="outline" onClick={() => setConfirming(id)}>
        {label}
      </Button>
    );
  }

  return (
    <main className="screen settings-screen mx-auto max-w-2xl p-6">
      <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
        Settings
      </h1>
      <fieldset className="mt-6">
        <legend className="mb-3 text-sm font-semibold text-muted-foreground">
          Preferences
        </legend>
        <div className="flex flex-col gap-3">
          {TOGGLES.map(({ key, label }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
            >
              <Label htmlFor={`toggle-${key}`} className="font-normal">
                {label}
              </Label>
              <Switch
                id={`toggle-${key}`}
                checked={settings[key] as boolean}
                onCheckedChange={(checked) =>
                  dispatch({ type: "SET_SETTING", key, value: checked })
                }
              />
            </div>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="mb-3 text-sm font-semibold text-muted-foreground">
          Reset Data
        </legend>
        <div className="flex flex-col gap-3">
          <ResetRow
            id="high-scores"
            label="Reset High Scores"
            action="RESET_HIGH_SCORES"
          />
          <ResetRow
            id="coins"
            label="Reset Coins & Purchases"
            action="RESET_COINS_AND_PURCHASES"
          />
          <ResetRow
            id="everything"
            label="Reset Everything"
            action="RESET_EVERYTHING"
          />
        </div>
      </fieldset>

      <div className="screen-actions mt-6">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: "NAVIGATE", screen: "main-menu" })}
        >
          Back
        </Button>
      </div>
    </main>
  );
}
