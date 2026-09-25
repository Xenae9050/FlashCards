import { describe, it, expect } from "vitest";
import {
  computePoints,
  computeCoinsForAnswer,
  streakMultiplierFor,
} from "../src/domain/scoring";

describe("streakMultiplierFor", () => {
  it("follows the bracket table", () => {
    expect(streakMultiplierFor(1)).toBe(1.0);
    expect(streakMultiplierFor(4)).toBe(1.0);
    expect(streakMultiplierFor(5)).toBe(1.25);
    expect(streakMultiplierFor(9)).toBe(1.25);
    expect(streakMultiplierFor(10)).toBe(1.5);
    expect(streakMultiplierFor(14)).toBe(1.5);
    expect(streakMultiplierFor(15)).toBe(1.75);
    expect(streakMultiplierFor(19)).toBe(1.75);
    expect(streakMultiplierFor(20)).toBe(2.0);
    expect(streakMultiplierFor(24)).toBe(2.0);
    expect(streakMultiplierFor(7)).toBe(1.25);
  });
});

describe("computePoints", () => {
  it("matches the worked example: Medium, streak 7, fast => 19", () => {
    expect(computePoints("Medium", 7, true)).toBe(19);
  });

  it("defaults difficulty to Medium when undefined", () => {
    expect(computePoints(undefined, 1, false)).toBe(10);
  });

  it("Easy/Hard base values scale correctly", () => {
    expect(computePoints("Easy", 1, false)).toBe(5);
    expect(computePoints("Hard", 1, false)).toBe(20);
  });
});

describe("computeCoinsForAnswer", () => {
  it("matches the worked example: 19 points => 4 coins", () => {
    expect(computeCoinsForAnswer(19)).toBe(4);
  });

  it("floors at the minimum of 1 coin", () => {
    expect(computeCoinsForAnswer(1)).toBe(1);
    expect(computeCoinsForAnswer(0)).toBe(1);
  });
});

describe("incorrect answers", () => {
  it("never call computeCoinsForAnswer with anything but 0 points (0 coins => still floors to 1, so caller must special-case incorrect answers to skip Coins entirely)", () => {
    // computeCoinsForAnswer always floors to at least 1 — this is why the scoring
    // engine (Section 10.6) must never call it for an incorrect/timeout answer.
    expect(computeCoinsForAnswer(0)).toBe(1);
  });
});
