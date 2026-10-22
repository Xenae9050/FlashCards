import type { Difficulty, Grade } from "./types";
import {
  POINTS_BASE_BY_DIFFICULTY,
  STREAK_MULTIPLIER_STEP,
  STREAK_MULTIPLIER_BRACKET_SIZE,
  SPEED_BONUS_MULTIPLIER,
  COINS_PER_POINTS_DIVISOR,
  COINS_MINIMUM_PER_CORRECT_ANSWER,
  COINS_PER_TEST_QUESTION_BY_GRADE,
} from "./constants";

export function streakMultiplierFor(
  streakCountAfterThisAnswer: number,
): number {
  const bracket = Math.floor(
    streakCountAfterThisAnswer / STREAK_MULTIPLIER_BRACKET_SIZE,
  );
  return 1.0 + STREAK_MULTIPLIER_STEP * bracket;
}

export function computePoints(
  difficulty: Difficulty | undefined,
  streakCountAfterThisAnswer: number,
  isFast: boolean,
): number {
  const base = POINTS_BASE_BY_DIFFICULTY[difficulty ?? "Medium"];
  const streakMultiplier = streakMultiplierFor(streakCountAfterThisAnswer);
  const speedBonus = isFast ? SPEED_BONUS_MULTIPLIER : 1.0;
  return Math.round(base * streakMultiplier * speedBonus);
}

export function computeTestCoins(totalQuestions: number, grade: Grade): number {
  return Math.round(totalQuestions * COINS_PER_TEST_QUESTION_BY_GRADE[grade]);
}

export function computeCoinsForAnswer(pointsEarned: number): number {
  return Math.max(
    COINS_MINIMUM_PER_CORRECT_ANSWER,
    Math.round(pointsEarned / COINS_PER_POINTS_DIVISOR),
  );
}
