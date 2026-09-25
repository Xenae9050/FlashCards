import { describe, it, expect } from "vitest";
import { buildDeck } from "../src/domain/deck";
import type { Pool, Question } from "../src/domain/types";

function makeQuestions(
  count: number,
  prefix: string,
  difficulty: "Easy" | "Medium" | "Hard" = "Medium",
): Question[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i}`,
    prompt: `Question ${prefix}-${i}`,
    choices: ["A", "B"],
    correctChoice: "A",
    difficulty,
  }));
}

describe("buildDeck", () => {
  it("includes every question exactly once, no duplicates, none missing", () => {
    const bigPool: Pool = {
      id: "big",
      poolName: "Big",
      questions: makeQuestions(200, "big"),
    };
    const smallPool: Pool = {
      id: "small",
      poolName: "Small",
      questions: makeQuestions(10, "small"),
    };
    const deck = buildDeck([bigPool, smallPool], ["Easy", "Medium", "Hard"]);
    expect(deck.length).toBe(210);
    const ids = new Set(deck.map((dq) => `${dq.poolId}:${dq.question.id}`));
    expect(ids.size).toBe(210);
  });

  it("round-robins so a small pool's questions appear early", () => {
    const bigPool: Pool = {
      id: "big",
      poolName: "Big",
      questions: makeQuestions(200, "big"),
    };
    const smallPool: Pool = {
      id: "small",
      poolName: "Small",
      questions: makeQuestions(10, "small"),
    };
    const deck = buildDeck([bigPool, smallPool], ["Easy", "Medium", "Hard"]);
    const first20 = deck.slice(0, 20);
    expect(first20.some((dq) => dq.poolId === "big")).toBe(true);
    expect(first20.some((dq) => dq.poolId === "small")).toBe(true);
  });

  it("filters by difficulty, absent difficulty treated as Medium", () => {
    const pool: Pool = {
      id: "p",
      poolName: "P",
      questions: [
        {
          id: "q1",
          prompt: "p1",
          choices: ["A", "B"],
          correctChoice: "A",
          difficulty: "Easy",
        },
        {
          id: "q2",
          prompt: "p2",
          choices: ["A", "B"],
          correctChoice: "A",
          difficulty: "Hard",
        },
        { id: "q3", prompt: "p3", choices: ["A", "B"], correctChoice: "A" }, // no difficulty => Medium
      ],
    };
    const deck = buildDeck([pool], ["Easy"]);
    expect(deck.length).toBe(1);
    expect(deck[0].question.id).toBe("q1");

    const deckMedium = buildDeck([pool], ["Medium"]);
    expect(deckMedium.length).toBe(1);
    expect(deckMedium[0].question.id).toBe("q3");
  });

  it("skips pools that become empty after filtering, without error", () => {
    const emptyAfterFilter: Pool = {
      id: "e",
      poolName: "E",
      questions: makeQuestions(5, "e", "Hard"),
    };
    const deck = buildDeck([emptyAfterFilter], ["Easy"]);
    expect(deck).toEqual([]);
  });
});
