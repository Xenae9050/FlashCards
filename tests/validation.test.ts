import { describe, it, expect } from "vitest";
import { validatePool } from "../src/domain/validation";

const validPool = {
  poolName: "General Knowledge",
  description: "desc",
  category: "General",
  questions: [
    {
      id: "gk-001",
      prompt: "What is the capital of France?",
      difficulty: "Easy",
      choices: ["Paris", "Berlin", "Madrid", "Rome"],
      correctChoice: "Paris",
      explanation: "...",
    },
  ],
};

describe("validatePool", () => {
  it("accepts a well-formed pool", () => {
    const result = validatePool("general-knowledge.json", validPool);
    expect("pool" in result).toBe(true);
    if ("pool" in result) {
      expect(result.pool.id).toBe("general-knowledge");
      expect(result.pool.questions.length).toBe(1);
    }
  });

  it("rejects missing Pool Name (rule 1)", () => {
    const result = validatePool("x.json", { ...validPool, poolName: "" });
    expect("errors" in result).toBe(true);
  });

  it("rejects zero questions (rule 2)", () => {
    const result = validatePool("x.json", { ...validPool, questions: [] });
    expect("errors" in result).toBe(true);
  });

  it("rejects an empty prompt (rule 3)", () => {
    const bad = {
      ...validPool,
      questions: [{ ...validPool.questions[0], prompt: "" }],
    };
    const result = validatePool("x.json", bad);
    expect("errors" in result).toBe(true);
  });

  it("rejects a wrong number of choices (rule 4)", () => {
    const bad = {
      ...validPool,
      questions: [{ ...validPool.questions[0], choices: ["A", "B", "C"] }],
    };
    const result = validatePool("x.json", bad);
    expect("errors" in result).toBe(true);
  });

  it("rejects correctChoice not matching exactly one choice (rule 5)", () => {
    const bad = {
      ...validPool,
      questions: [{ ...validPool.questions[0], correctChoice: "Nowhere" }],
    };
    const result = validatePool("x.json", bad);
    expect("errors" in result).toBe(true);
  });

  it("rejects two identical choices (rule 6)", () => {
    const bad = {
      ...validPool,
      questions: [
        {
          ...validPool.questions[0],
          choices: ["Paris", "Paris", "Madrid", "Rome"],
          correctChoice: "Paris",
        },
      ],
    };
    const result = validatePool("x.json", bad);
    expect("errors" in result).toBe(true);
  });

  it("rejects duplicate question ids within a pool (rule 7)", () => {
    const bad = {
      ...validPool,
      questions: [validPool.questions[0], { ...validPool.questions[0] }],
    };
    const result = validatePool("x.json", bad);
    expect("errors" in result).toBe(true);
  });

  it("rejects an invalid difficulty value (rule 8)", () => {
    const bad = {
      ...validPool,
      questions: [{ ...validPool.questions[0], difficulty: "Extreme" }],
    };
    const result = validatePool("x.json", bad);
    expect("errors" in result).toBe(true);
  });
});
