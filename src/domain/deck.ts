import type { Pool, DeckQuestion, Difficulty } from "./types";

export function buildDeck(
  selectedPools: Pool[],
  difficultyFilter: Difficulty[],
): DeckQuestion[] {
  const filterSet = new Set(difficultyFilter);

  // 1. Filter by difficulty (absent difficulty ⇒ 'Medium'), then independently shuffle each pool's list.
  const perPoolQueues = [...selectedPools]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((pool) => ({
      poolId: pool.id,
      queue: fisherYatesShuffle(
        pool.questions.filter((q) => filterSet.has(q.difficulty ?? "Medium")),
      ),
    }))
    .filter((p) => p.queue.length > 0);

  // 2. Round-robin interleave: one question from each non-empty queue, in pool order, looping
  //    until every queue is empty. This guarantees even coverage — a 200-question pool never
  //    drowns out a 10-question pool early in the run.
  const deck: DeckQuestion[] = [];
  let remaining = perPoolQueues.reduce((sum, p) => sum + p.queue.length, 0);
  while (remaining > 0) {
    for (const p of perPoolQueues) {
      if (p.queue.length === 0) continue;
      deck.push({ poolId: p.poolId, question: p.queue.shift()! });
      remaining--;
    }
  }
  return deck;
}

export function fisherYatesShuffle<T>(input: T[]): T[] {
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
