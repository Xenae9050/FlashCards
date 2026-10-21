import type {
  Grade,
  TestAnswer,
  TestBreakdownEntry,
  TestReport,
} from "./types";

export function computeGrade(percent: number): Grade {
  if (percent >= 95) return "A+";
  if (percent >= 85) return "A";
  if (percent >= 70) return "B";
  if (percent >= 60) return "C";
  if (percent >= 50) return "D";
  if (percent >= 40) return "E";
  return "F";
}

function tally(
  answers: TestAnswer[],
  keysFor: (a: TestAnswer) => string[],
): TestBreakdownEntry[] {
  const map = new Map<string, TestBreakdownEntry>();
  for (const a of answers) {
    const correct = a.selected === a.question.correctChoice;
    for (const label of keysFor(a)) {
      const entry = map.get(label) ?? { label, correct: 0, total: 0 };
      entry.total += 1;
      if (correct) entry.correct += 1;
      map.set(label, entry);
    }
  }
  return [...map.values()].sort(
    (a, b) => a.correct / a.total - b.correct / b.total || b.total - a.total,
  );
}

export function buildTestReport(answers: TestAnswer[]): TestReport {
  const total = answers.length;
  const incorrect = answers.filter(
    (a) => a.selected !== a.question.correctChoice,
  );
  const correct = total - incorrect.length;
  const percent = total === 0 ? 0 : Math.round((correct / total) * 100);
  return {
    total,
    correct,
    percent,
    grade: computeGrade(percent),
    incorrect,
    answers,
    byPool: tally(answers, (a) => [a.poolId]),
    byTag: tally(answers, (a) => a.question.tags ?? []),
    byDifficulty: tally(answers, (a) => [a.question.difficulty ?? "Medium"]),
  };
}
