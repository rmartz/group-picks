import { describe, expect, it } from "vitest";

import {
  preseedAdoptedOptionRank,
  type PriorPickRanking,
  runRankedChoice,
} from "./ranked-choice";

describe("runRankedChoice", () => {
  it("returns an empty array when there are no ballots and no candidates", () => {
    expect(runRankedChoice([])).toEqual([]);
  });

  it("returns an empty array when allCandidates is empty and there are no ballots", () => {
    expect(runRankedChoice([], [])).toEqual([]);
  });

  it("returns a single candidate as the sole winner", () => {
    expect(runRankedChoice([["A"]])).toEqual([["A"]]);
  });

  it("returns the winner with a clear first-round majority", () => {
    const ballots = [
      ["A", "B"],
      ["A", "B"],
      ["A", "B"],
      ["B", "A"],
    ];
    // A: 3 votes, B: 1 vote. Total=4. Majority=2. A wins (3 > 2).
    // Second tier: B wins unopposed.
    expect(runRankedChoice(ballots)).toEqual([["A"], ["B"]]);
  });

  it("identifies the winner after a candidate is eliminated", () => {
    // A=2, B=2, C=1. No majority (need >2.5). Eliminate C. C's vote goes to B.
    // A=2, B=3. B wins (3 > 2.5).
    const ballots = [
      ["A", "B", "C"],
      ["A", "B", "C"],
      ["B", "A", "C"],
      ["B", "A", "C"],
      ["C", "B", "A"],
    ];
    expect(runRankedChoice(ballots)).toEqual([["B"], ["A"], ["C"]]);
  });

  it("eliminates the two lowest candidates when they are tied for last", () => {
    // A=2, B=1, C=1. No majority (need >2). Eliminate B and C (tied at 1).
    // A wins unopposed. Then B and C remain and are tied.
    const ballots = [
      ["A", "B", "C"],
      ["A", "C", "B"],
      ["B", "A", "C"],
      ["C", "A", "B"],
    ];
    expect(runRankedChoice(ballots)).toEqual([["A"], ["B", "C"]]);
  });

  describe("ties", () => {
    it("groups all candidates in a single tier when all have equal first-choice votes", () => {
      const ballots = [
        ["A", "B"],
        ["B", "A"],
      ];
      // A=1, B=1. No majority. Min=max=1. All tied.
      expect(runRankedChoice(ballots)).toEqual([["A", "B"]]);
    });

    it("groups all three candidates when all are equally tied on first choices", () => {
      const ballots = [
        ["A", "B", "C"],
        ["B", "C", "A"],
        ["C", "A", "B"],
      ];
      // A=1, B=1, C=1. No majority. Min=max=1. All tied.
      expect(runRankedChoice(ballots)).toEqual([["A", "B", "C"]]);
    });

    it("places a clear winner first, then groups the remaining tied candidates", () => {
      // C gets a majority after internal elimination of A and B (tied at min).
      // In iterative round 2, A and B are equal → tied.
      const ballots = [
        ["C", "A", "B"],
        ["C", "B", "A"],
        ["A", "C", "B"],
        ["B", "C", "A"],
      ];
      // C=2, A=1, B=1. No majority (need >2). Eliminate A and B (tied at min=1).
      // C wins unopposed. Then A and B remain tied.
      expect(runRankedChoice(ballots)).toEqual([["C"], ["A", "B"]]);
    });
  });

  describe("single voter", () => {
    it("returns the voter's preference order as the full ranking", () => {
      const ballots = [["D", "B", "C", "A"]];
      // D wins round 1 (1 vote > 0.5). Then B, C, A sequentially.
      expect(runRankedChoice(ballots)).toEqual([["D"], ["B"], ["C"], ["A"]]);
    });
  });

  describe("all options equally ranked", () => {
    it("returns candidates in consensus order when all voters rank the same way", () => {
      const ballots = [
        ["A", "B", "C"],
        ["A", "B", "C"],
        ["A", "B", "C"],
      ];
      // A: 3 votes = majority each round.
      expect(runRankedChoice(ballots)).toEqual([["A"], ["B"], ["C"]]);
    });

    it("places all candidates in a single tied tier when all voters split evenly", () => {
      const ballots = [
        ["A", "B", "C"],
        ["B", "C", "A"],
        ["C", "A", "B"],
      ];
      // A=1, B=1, C=1 every round → all tied.
      expect(runRankedChoice(ballots)).toEqual([["A", "B", "C"]]);
    });
  });

  describe("options with no votes", () => {
    it("places candidates that appear on no ballot at the bottom in a tied group", () => {
      const ballots = [["A"], ["A"]];
      // A=2 → majority. Then B and C both get 0 votes and are tied.
      expect(runRankedChoice(ballots, ["A", "B", "C"])).toEqual([
        ["A"],
        ["B", "C"],
      ]);
    });

    it("ranks unvoted candidates below tied voting candidates", () => {
      const ballots = [
        ["A", "B"],
        ["B", "A"],
      ];
      // A=1, B=1, C=0. C eliminated internally. A and B tied → share first tier.
      // Outer loop: C is still in remaining → round 2, C wins unopposed.
      expect(runRankedChoice(ballots, ["A", "B", "C"])).toEqual([
        ["A", "B"],
        ["C"],
      ]);
    });

    it("returns all no-vote candidates in a single tier when no ballots are cast", () => {
      expect(runRankedChoice([], ["X", "Y", "Z"])).toEqual([["X", "Y", "Z"]]);
    });
  });
});

function makePriorPickRanking(
  overrides?: Partial<PriorPickRanking>,
): PriorPickRanking {
  return {
    categoryId: "category-1",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    rankedOptionIds: ["option-a", "option-b", "option-c"],
    ...overrides,
  };
}

describe("preseedAdoptedOptionRank", () => {
  it("inserts the adopted option at the same rank from the most recent prior pick in the same category", () => {
    const seededRanking = preseedAdoptedOptionRank({
      adoptedOptionId: "option-b",
      categoryId: "category-1",
      currentRanking: ["option-x", "option-y", "option-z"],
      priorPickRankings: [
        makePriorPickRanking({
          createdAt: new Date("2025-01-01T00:00:00.000Z"),
          rankedOptionIds: ["option-a", "option-b", "option-c"],
        }),
        makePriorPickRanking({
          createdAt: new Date("2025-02-01T00:00:00.000Z"),
          rankedOptionIds: ["option-b", "option-a", "option-c"],
        }),
      ],
    });

    expect(seededRanking).toEqual([
      "option-b",
      "option-x",
      "option-y",
      "option-z",
    ]);
  });

  it("pushes existing options down when the pre-seeded rank collides", () => {
    const seededRanking = preseedAdoptedOptionRank({
      adoptedOptionId: "option-b",
      categoryId: "category-1",
      currentRanking: ["option-x", "option-y", "option-z"],
      priorPickRankings: [makePriorPickRanking()],
    });

    expect(seededRanking).toEqual([
      "option-x",
      "option-b",
      "option-y",
      "option-z",
    ]);
  });

  it("appends the adopted option when the prior rank exceeds the current list length", () => {
    const seededRanking = preseedAdoptedOptionRank({
      adoptedOptionId: "option-c",
      categoryId: "category-1",
      currentRanking: ["option-x"],
      priorPickRankings: [makePriorPickRanking()],
    });

    expect(seededRanking).toEqual(["option-x", "option-c"]);
  });

  it("does not pre-seed when the option has no prior ranking in the same category", () => {
    const currentRanking = ["option-x", "option-y"];
    const seededRanking = preseedAdoptedOptionRank({
      adoptedOptionId: "option-missing",
      categoryId: "category-1",
      currentRanking,
      priorPickRankings: [makePriorPickRanking()],
    });

    expect(seededRanking).toEqual(currentRanking);
  });

  it("does not use prior rankings from other categories", () => {
    const currentRanking = ["option-x", "option-y"];
    const seededRanking = preseedAdoptedOptionRank({
      adoptedOptionId: "option-b",
      categoryId: "category-1",
      currentRanking,
      priorPickRankings: [
        makePriorPickRanking({
          categoryId: "category-2",
          rankedOptionIds: ["option-a", "option-b"],
        }),
      ],
    });

    expect(seededRanking).toEqual(currentRanking);
  });

  it("does not re-seed options that are already in the current ranking", () => {
    const currentRanking = ["option-x", "option-b", "option-y"];
    const seededRanking = preseedAdoptedOptionRank({
      adoptedOptionId: "option-b",
      categoryId: "category-1",
      currentRanking,
      priorPickRankings: [makePriorPickRanking()],
    });

    expect(seededRanking).toBe(currentRanking);
  });
});
