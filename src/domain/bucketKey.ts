import type { Configuration, Difficulty, HighScoreEntry } from "./types";
import { TOP_N_PER_BUCKET } from "./constants";

export function computeBucketKey(config: Configuration): string {
  const sortedPoolIds = [...config.selectedPoolIds].sort().join(",");
  const difficultyOrder: Difficulty[] = ["Easy", "Medium", "Hard"];
  const sortedDifficulties = difficultyOrder
    .filter((d) => config.difficultyFilter.includes(d))
    .join(",");
  return `${config.mode}|setting=${config.modeSettingSeconds}|pools=${sortedPoolIds}|difficulty=${sortedDifficulties}`;
}

export function formatConfigurationLabel(
  config: Configuration,
  poolNamesById: Record<string, string>,
): string {
  const modeLabel: Record<Configuration["mode"], string> = {
    "sudden-death": "Sudden Death",
    race: "Race",
    quickdraw: "Quickdraw",
    test: "Test",
  };
  const settingLabel =
    config.mode === "race"
      ? `${Math.round(config.modeSettingSeconds / 60)} min`
      : config.mode === "test"
        ? `${config.modeSettingSeconds} questions`
        : `${config.modeSettingSeconds}s`;
  const pools = config.selectedPoolIds
    .map((id) => poolNamesById[id] ?? id)
    .join(" + ");
  const difficultyLabel =
    config.difficultyFilter.length === 3
      ? "All difficulties"
      : `${config.difficultyFilter.join(", ")} only`;
  return `${
    modeLabel[config.mode]
  } · ${settingLabel} · ${pools} · ${difficultyLabel}`;
}

export function insertHighScoreEntry(
  existing: HighScoreEntry[],
  candidate: HighScoreEntry,
): { updated: HighScoreEntry[]; rank: number | null } {
  const combined = [...existing, candidate];
  combined.sort(compareHighScoreEntries);
  const index = combined.indexOf(candidate); // reference equality — safe, `candidate` is a fresh object
  const updated = combined.slice(0, TOP_N_PER_BUCKET);
  const rank = index < TOP_N_PER_BUCKET ? index + 1 : null;
  return { updated, rank };
}

function compareHighScoreEntries(a: HighScoreEntry, b: HighScoreEntry): number {
  if (b.points !== a.points) return b.points - a.points; // higher points first
  return new Date(a.achievedAt).getTime() - new Date(b.achievedAt).getTime(); // earlier timestamp wins ties
}
