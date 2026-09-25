import { describe, it, expect } from "vitest";
import { computeBucketKey } from "../src/domain/bucketKey";
import type { Configuration } from "../src/domain/types";

const base: Configuration = {
  mode: "sudden-death",
  modeSettingSeconds: 10,
  selectedPoolIds: ["general-knowledge", "world-capitals"],
  difficultyFilter: ["Easy", "Hard"],
};

describe("computeBucketKey", () => {
  it("produces an identical key regardless of selection order", () => {
    const reordered: Configuration = {
      ...base,
      selectedPoolIds: ["world-capitals", "general-knowledge"],
      difficultyFilter: ["Hard", "Easy"],
    };
    expect(computeBucketKey(base)).toBe(computeBucketKey(reordered));
  });

  it("changes when mode differs", () => {
    expect(computeBucketKey(base)).not.toBe(
      computeBucketKey({ ...base, mode: "race" }),
    );
  });

  it("changes when modeSettingSeconds differs", () => {
    expect(computeBucketKey(base)).not.toBe(
      computeBucketKey({ ...base, modeSettingSeconds: 20 }),
    );
  });

  it("changes when pools differ", () => {
    expect(computeBucketKey(base)).not.toBe(
      computeBucketKey({ ...base, selectedPoolIds: ["general-knowledge"] }),
    );
  });

  it("changes when difficulty filter differs", () => {
    expect(computeBucketKey(base)).not.toBe(
      computeBucketKey({ ...base, difficultyFilter: ["Easy"] }),
    );
  });
});
