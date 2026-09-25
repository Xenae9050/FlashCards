import type { Pool, Question, PoolValidationError, Difficulty } from "./types";

export function validatePool(
  fileName: string,
  raw: unknown,
): { pool: Pool } | { errors: PoolValidationError[] } {
  const errors: PoolValidationError[] = [];
  const err = (message: string) => errors.push({ fileName, message });

  if (typeof raw !== "object" || raw === null) {
    return { errors: [{ fileName, message: "Is not a JSON object." }] };
  }
  const data = raw as Record<string, unknown>;

  // Rule 1: Pool Name present
  if (typeof data.poolName !== "string" || data.poolName.trim() === "") {
    err("Missing a Pool Name.");
  }

  const questionsRaw = Array.isArray(data.questions) ? data.questions : [];

  // Rule 2: at least one question
  if (questionsRaw.length === 0) {
    err("Contains no questions.");
  }

  const seenIds = new Set<string>();
  const validQuestions: Question[] = [];

  questionsRaw.forEach((q, index) => {
    const n = index + 1;
    const question = q as Record<string, unknown>;
    const idLabel = typeof question.id === "string" ? question.id : `#${n}`;

    // Rule 3: non-empty prompt
    if (typeof question.prompt !== "string" || question.prompt.trim() === "") {
      err(`Question ${n} (id: ${idLabel}) has an empty prompt.`);
      return; // skip further checks on this malformed question
    }

    const choices = Array.isArray(question.choices)
      ? (question.choices as unknown[])
      : [];

    // Rule 4: exactly 2 or exactly 4 choices
    if (choices.length !== 2 && choices.length !== 4) {
      err(
        `Question ${n} has ${choices.length} choices; only exactly 2 or exactly 4 are allowed.`,
      );
      return;
    }
    if (!choices.every((c) => typeof c === "string" && c.trim() !== "")) {
      err(`Question ${n} has a choice that is empty or not text.`);
      return;
    }

    // Rule 6: no two identical choices
    const uniqueChoices = new Set(choices as string[]);
    if (uniqueChoices.size !== choices.length) {
      err(`Question ${n} has two identical choices.`);
    }

    // Rule 5: exactly one correct choice, matching a choice's text exactly
    const correctMatches = (choices as string[]).filter(
      (c) => c === question.correctChoice,
    ).length;
    if (correctMatches !== 1) {
      err(
        `Question ${n}'s correctChoice does not match exactly one of its choices.`,
      );
    }

    // Rule 7: unique question id within the pool
    if (typeof question.id !== "string" || question.id.trim() === "") {
      err(`Question ${n} is missing an id.`);
    } else if (seenIds.has(question.id)) {
      err(`Question id '${question.id}' is used more than once in this pool.`);
    } else {
      seenIds.add(question.id);
    }

    // Rule 8: difficulty, if given, must be Easy/Medium/Hard
    if (
      question.difficulty !== undefined &&
      !["Easy", "Medium", "Hard"].includes(question.difficulty as string)
    ) {
      err(
        `Question ${n} has an invalid difficulty value ('${question.difficulty}'); must be Easy, Medium or Hard.`,
      );
    }

    validQuestions.push({
      id: String(question.id),
      prompt: question.prompt as string,
      choices: choices as string[],
      correctChoice: question.correctChoice as string,
      explanation:
        typeof question.explanation === "string"
          ? question.explanation
          : undefined,
      difficulty: (question.difficulty as Difficulty | undefined) ?? undefined,
      tags: Array.isArray(question.tags)
        ? (question.tags as string[])
        : undefined,
      imageRef:
        typeof question.imageRef === "string" ? question.imageRef : undefined,
    });
  });

  if (errors.length > 0) return { errors };

  return {
    pool: {
      id: fileName.replace(/\.json$/, ""),
      poolName: data.poolName as string,
      description:
        typeof data.description === "string" ? data.description : undefined,
      category: typeof data.category === "string" ? data.category : undefined,
      iconColorTag:
        typeof data.iconColorTag === "string" ? data.iconColorTag : undefined,
      author: typeof data.author === "string" ? data.author : undefined,
      version: (data.version as string | number | undefined) ?? undefined,
      questions: validQuestions,
    },
  };
}
