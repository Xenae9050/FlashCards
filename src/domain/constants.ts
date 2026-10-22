import type { Mode, Difficulty, Grade } from "./types";

export const MODE_SETTING_RANGES: Record<
  Mode,
  { min: number; max: number; presetsSeconds: number[]; defaultSeconds: number }
> = {
  "sudden-death": {
    min: 3,
    max: 60,
    presetsSeconds: [5, 10, 15, 20, 30],
    defaultSeconds: 10,
  }, // DB §5.2
  race: {
    min: 30,
    max: 1200,
    presetsSeconds: [60, 120, 180, 300, 600],
    defaultSeconds: 180,
  }, // DB §5.3 (minutes shown in UI, stored as seconds)
  quickdraw: {
    min: 2,
    max: 15,
    presetsSeconds: [3, 5, 7, 10],
    defaultSeconds: 5,
  }, // DB §5.4
  // Test mode: the "seconds" setting holds the NUMBER OF QUESTIONS.
  test: {
    min: 5,
    max: 100,
    presetsSeconds: [10, 20, 30, 50],
    defaultSeconds: 20,
  },
};

export const QUICKDRAW_LIVES = 3; // DB §5.4 — fixed, not configurable

export const MIN_RECOMMENDED_QUESTIONS = 10; // DB §3.7 — below this, show the non-blocking "may end early" warning

export const TOP_N_PER_BUCKET = 10; // DB §7.3

// --- Points formula (DB §6.1): Base(Difficulty) x Streak Multiplier x Speed Bonus, rounded ---
export const POINTS_BASE_BY_DIFFICULTY: Record<Difficulty, number> = {
  Easy: 5,
  Medium: 10,
  Hard: 20,
};
export const STREAK_MULTIPLIER_STEP = 0.25; // +0.25 per full bracket of 5
export const STREAK_MULTIPLIER_BRACKET_SIZE = 5; // streak counts 1-4 ⇒ bracket 0, 5-9 ⇒ bracket 1, etc.
export const SPEED_BONUS_MULTIPLIER = 1.5;
export const RACE_FAST_ANSWER_THRESHOLD_MS = 3000; // DB §6.1 — Race has no per-question timer, flat 3s threshold

// --- Coins formula (DB §6.2) ---
export const COINS_PER_POINTS_DIVISOR = 5;
export const COINS_MINIMUM_PER_CORRECT_ANSWER = 1;
export const COINS_BONUS_NEW_TOP_10 = 50;
export const COINS_BONUS_NEW_NUMBER_ONE_ADDITIONAL = 50; // on top of the Top-10 bonus ⇒ 100 total for #1
export const COINS_BONUS_POOL_EXHAUSTED = 25;
// Test mode: coins per question in the test, multiplied by the final grade's rate (rounded).
export const COINS_PER_TEST_QUESTION_BY_GRADE: Record<Grade, number> = {
  "A+": 2,
  A: 1.5,
  B: 1,
  C: 0.75,
  D: 0.5,
  E: 0.25,
  F: 0,
};

// --- Reveal / Continue timing (DB §4.5) ---
export const MIN_VIEW_TIME_MS: Record<Mode, number> = {
  "sudden-death": 1500,
  race: 500,
  quickdraw: 1500,
  test: 0,
};
export const AUTO_ADVANCE_DELAY_MS: Record<Mode, number> = {
  "sudden-death": 4000,
  race: 1000,
  quickdraw: 4000,
  test: 0,
};
// Invariant that must always hold: AUTO_ADVANCE_DELAY_MS[mode] >= MIN_VIEW_TIME_MS[mode]

export const READY_COUNTDOWN_MS = 3000; // the fixed "3-2-1" Ready Screen countdown (DB §9), not configurable
