export type Difficulty = "Easy" | "Medium" | "Hard";

export type Mode = "sudden-death" | "race" | "quickdraw";

/** One question as loaded from a pool file, plus its derived pool id. */
export interface Question {
  id: string; // unique within its pool (raw field: "id")
  prompt: string;
  choices: string[]; // length is exactly 2 or exactly 4
  correctChoice: string; // must exactly match one entry in `choices`
  explanation?: string;
  difficulty?: Difficulty; // absent ⇒ treated as 'Medium' everywhere it matters
  tags?: string[]; // reserved for future filtering (DB §13) — not used by any UI in v1
  imageRef?: string; // reserved for future image support (DB §13) — not rendered in v1
}

/** A loaded, validated pool. `id` is derived from the filename, not the JSON content. */
export interface Pool {
  id: string; // filename without ".json", e.g. "general-knowledge"
  poolName: string;
  description?: string;
  category?: string; // absent ⇒ grouped under "General" on the Pool Selection screen
  iconColorTag?: string;
  author?: string;
  version?: string | number;
  questions: Question[];
}

export interface PoolValidationError {
  fileName: string;
  message: string;
}

/** The full set of choices a player made before starting a run. */
export interface Configuration {
  mode: Mode;
  modeSettingSeconds: number; // countdown (sudden-death) / overall limit (race) / per-question limit (quickdraw)
  selectedPoolIds: string[]; // length >= 1
  difficultyFilter: Difficulty[]; // subset of ['Easy','Medium','Hard'], length >= 1
}

/** One question drawn into a run's shared deck, tagged with its source pool. */
export interface DeckQuestion {
  poolId: string;
  question: Question;
}

export type RunEndReason =
  | "mistake" // Sudden Death: wrong answer / timeout
  | "lives-depleted" // Quickdraw: third life lost
  | "clock-expired" // Race: overall timer reached zero
  | "pool-exhausted" // any mode: deck ran out
  | "stop-and-save" // Sudden Death / Quickdraw: voluntary bank
  | "quit"; // any mode: Quit to Main Menu from Pause

export interface HighScoreEntry {
  points: number;
  achievedAt: string; // ISO 8601 timestamp
  configuration: Configuration; // snapshot, for display on the High Scores screen
  nickname?: string;
}

export type Screen =
  | "main-menu"
  | "pool-selection"
  | "mode-selection"
  | "mode-configuration"
  | "ready"
  | "gameplay"
  | "results"
  | "high-scores"
  | "shop"
  | "settings"
  | "how-to-play";

// --- Persisted save-file shapes (Section 6) ---

export interface SettingsFile {
  schemaVersion: number;
  soundEffects: boolean;
  reduceMotion: boolean;
  colourBlindFriendly: boolean;
  highContrast: boolean;
  silentMode: boolean;
  answerKeyHints: boolean;
}

export interface WalletFile {
  schemaVersion: number;
  coins: number;
}

export type ShopCategory =
  | "theme"
  | "cardStyle"
  | "avatar"
  | "celebration"
  | "soundPack";

export interface ShopFile {
  schemaVersion: number;
  ownedItemIds: string[];
  equipped: {
    theme: string;
    cardStyle: string;
    celebration: string;
    soundPack: string;
    avatar: string | null;
  };
}

export interface HighScoresFile {
  schemaVersion: number;
  buckets: Record<string, HighScoreEntry[]>;
}

export interface ResultSummary {
  config: Configuration;
  runEndReason: RunEndReason;
  correctCount: number;
  attemptedCount: number;
  pointsTotal: number;
  coinsEarnedThisRun: number;
  milestoneBonus: number;
  totalCoinsThisRun: number;
  rank: number | null;
  bucketKey: string;
}
