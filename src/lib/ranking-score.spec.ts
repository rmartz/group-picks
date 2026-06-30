import { describe, expect, it } from "vitest";

import type { Option } from "@/lib/types/option";
import { RankingTier } from "@/lib/types/ranking";

import {
  computeOptionTierAttribution,
  computeRankedResults,
} from "./ranking-score";

function makeOption(id: string, title: string): Option {
  return { id, title, pickId: "pick-1", ownerIds: ["user-1"] };
}

const optA = makeOption("opt-a", "Option A");
const optB = makeOption("opt-b", "Option B");
const optC = makeOption("opt-c", "Option C");
const optD = makeOption("opt-d", "Option D");

describe("computeRankedResults", () => {
  it("returns empty arrays for no options", () => {
    const { topPicks, runnersUp } = computeRankedResults({}, [], 3);
    expect(topPicks).toHaveLength(0);
    expect(runnersUp).toHaveLength(0);
  });

  it("sets score from tier weights", () => {
    const allRankings = { "user-1": { "opt-a": RankingTier.LoveIt } };
    const { topPicks } = computeRankedResults(allRankings, [optA], 1);
    expect(topPicks[0]?.score).toBe(4);
  });

  it("assigns rank 1 to the highest-scoring option", () => {
    const allRankings = {
      "user-1": { "opt-a": RankingTier.LoveIt, "opt-b": RankingTier.Yes },
    };
    const { topPicks } = computeRankedResults(allRankings, [optA, optB], 2);
    const entry = topPicks.find((e) => e.option.id === "opt-a");
    expect(entry?.rank).toBe(1);
  });

  it("assigns the same rank to tied options", () => {
    const allRankings = {
      "user-1": { "opt-a": RankingTier.Yes, "opt-b": RankingTier.Yes },
    };
    const { topPicks } = computeRankedResults(allRankings, [optA, optB], 2);
    expect(topPicks[0]?.rank).toBe(topPicks[1]?.rank);
  });

  it("skips rank numbers after a tie", () => {
    // Scores: opt-a: 4, opt-b: 3, opt-c: 3, opt-d: 2 → ranks 1,2,2,4 (not 1,2,2,3)
    const allRankings = {
      "user-1": {
        "opt-a": RankingTier.LoveIt,
        "opt-b": RankingTier.Yes,
        "opt-c": RankingTier.Yes,
        "opt-d": RankingTier.Maybe,
      },
    };
    const { topPicks, runnersUp } = computeRankedResults(
      allRankings,
      [optA, optB, optC, optD],
      3,
    );
    const allEntries = [...topPicks, ...runnersUp];
    const dEntry = allEntries.find((e) => e.option.id === "opt-d");
    expect(dEntry?.rank).toBe(4);
  });

  it("expands topPicks past topCount when a tie spans the boundary", () => {
    const allRankings = {
      "user-1": {
        "opt-a": RankingTier.LoveIt,
        "opt-b": RankingTier.Yes,
        "opt-c": RankingTier.Yes,
      },
    };
    // opt-a: 4, opt-b: 3, opt-c: 3 — tie at rank 2, topCount=2
    const { topPicks, runnersUp } = computeRankedResults(
      allRankings,
      [optA, optB, optC],
      2,
    );
    expect(topPicks).toHaveLength(3);
    expect(runnersUp).toHaveLength(0);
  });

  it("puts options with rank > topCount in runnersUp", () => {
    const allRankings = {
      "user-1": {
        "opt-a": RankingTier.LoveIt,
        "opt-b": RankingTier.Yes,
        "opt-c": RankingTier.Maybe,
      },
    };
    const { topPicks, runnersUp } = computeRankedResults(
      allRankings,
      [optA, optB, optC],
      2,
    );
    expect(topPicks.map((e) => e.option.id)).toContain("opt-a");
    expect(topPicks.map((e) => e.option.id)).toContain("opt-b");
    expect(runnersUp.map((e) => e.option.id)).toContain("opt-c");
  });

  it("scores unranked options as 0", () => {
    const allRankings = { "user-1": { "opt-a": RankingTier.LoveIt } };
    const { topPicks, runnersUp } = computeRankedResults(
      allRankings,
      [optA, optB],
      2,
    );
    const allEntries = [...topPicks, ...runnersUp];
    const bEntry = allEntries.find((e) => e.option.id === "opt-b");
    expect(bEntry?.score).toBe(0);
  });
});

describe("computeOptionTierAttribution", () => {
  it("buckets members into option tiers and noRank by option", () => {
    const allRankings = {
      "user-1": { "opt-a": RankingTier.LoveIt, "opt-b": RankingTier.Yes },
      "user-2": { "opt-a": RankingTier.NotForMe },
      "user-3": { "opt-a": RankingTier.Unranked },
    };

    const attribution = computeOptionTierAttribution(
      allRankings,
      [optA],
      [
        { uid: "user-1", name: "Alice Johnson" },
        { uid: "user-2", name: "Bob Brown" },
        { uid: "user-3", name: "charlie@example.com" },
        { uid: "user-4", name: "Dana" },
      ],
    );

    expect(attribution["opt-a"]?.[RankingTier.LoveIt]).toEqual([
      { uid: "user-1", firstName: "Alice" },
    ]);
    expect(attribution["opt-a"]?.[RankingTier.NotForMe]).toEqual([
      { uid: "user-2", firstName: "Bob" },
    ]);
    expect(attribution["opt-a"]?.noRank).toEqual([
      { uid: "user-3", firstName: "charlie" },
      { uid: "user-4", firstName: "Dana" },
    ]);
  });

  it("extracts stable first-name display values from different name formats", () => {
    const attribution = computeOptionTierAttribution(
      {},
      [optA],
      [
        { uid: "u-empty", name: "   " },
        { uid: "u-email", name: "charlie@example.com" },
        { uid: "u-multi", name: "Alice Johnson" },
        { uid: "u-single", name: "Mononym" },
        { uid: "u-spaces", name: "   Bob   Brown   " },
        { uid: "u-special", name: "Élodie Durand" },
      ],
    );

    expect(attribution["opt-a"]?.noRank).toEqual([
      { uid: "u-empty", firstName: "Unknown" },
      { uid: "u-email", firstName: "charlie" },
      { uid: "u-multi", firstName: "Alice" },
      { uid: "u-single", firstName: "Mononym" },
      { uid: "u-spaces", firstName: "Bob" },
      { uid: "u-special", firstName: "Élodie" },
    ]);
  });
});
