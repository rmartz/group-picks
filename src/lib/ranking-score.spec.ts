import { describe, expect, it } from "vitest";

import type { Option } from "@/lib/types/option";
import { RankingTier } from "@/lib/types/ranking";

import { computeTopPicks } from "./ranking-score";

function makeOption(id: string, title: string): Option {
  return { id, title, pickId: "pick-1", ownerIds: ["user-1"] };
}

const optA = makeOption("opt-a", "Option A");
const optB = makeOption("opt-b", "Option B");
const optC = makeOption("opt-c", "Option C");
const optD = makeOption("opt-d", "Option D");

describe("computeTopPicks", () => {
  describe("with no rankings data", () => {
    it("returns the requested number of options when no rankings exist", () => {
      const result = computeTopPicks({}, [optA, optB, optC], 2);
      expect(result).toHaveLength(2);
    });

    it("returns all options when topCount exceeds option count", () => {
      const result = computeTopPicks({}, [optA, optB], 5);
      expect(result).toHaveLength(2);
    });
  });

  describe("scoring from tier rankings", () => {
    it("ranks LoveIt higher than Yes", () => {
      const allRankings = {
        "user-1": {
          "opt-a": RankingTier.LoveIt,
          "opt-b": RankingTier.Yes,
        },
      };
      const [first, second] = computeTopPicks(allRankings, [optA, optB], 2);
      expect(first?.id).toBe("opt-a");
      expect(second?.id).toBe("opt-b");
    });

    it("ranks Yes higher than Maybe", () => {
      const allRankings = {
        "user-1": {
          "opt-a": RankingTier.Yes,
          "opt-b": RankingTier.Maybe,
        },
      };
      const [first, second] = computeTopPicks(allRankings, [optA, optB], 2);
      expect(first?.id).toBe("opt-a");
      expect(second?.id).toBe("opt-b");
    });

    it("ranks Maybe higher than NotForMe", () => {
      const allRankings = {
        "user-1": {
          "opt-a": RankingTier.Maybe,
          "opt-b": RankingTier.NotForMe,
        },
      };
      const [first, second] = computeTopPicks(allRankings, [optA, optB], 2);
      expect(first?.id).toBe("opt-a");
      expect(second?.id).toBe("opt-b");
    });

    it("ranks NotForMe higher than Unranked", () => {
      const allRankings = {
        "user-1": {
          "opt-a": RankingTier.NotForMe,
          "opt-b": RankingTier.Unranked,
        },
      };
      const [first, second] = computeTopPicks(allRankings, [optA, optB], 2);
      expect(first?.id).toBe("opt-a");
      expect(second?.id).toBe("opt-b");
    });

    it("sums scores across multiple users", () => {
      const allRankings = {
        "user-1": { "opt-a": RankingTier.Yes, "opt-b": RankingTier.LoveIt },
        "user-2": { "opt-a": RankingTier.LoveIt, "opt-b": RankingTier.Yes },
        "user-3": { "opt-a": RankingTier.LoveIt, "opt-b": RankingTier.Maybe },
      };
      // opt-a: 3+4+4=11, opt-b: 4+3+2=9
      const [first] = computeTopPicks(allRankings, [optA, optB], 2);
      expect(first?.id).toBe("opt-a");
    });

    it("options not ranked by any user score 0 and appear last", () => {
      const allRankings = {
        "user-1": { "opt-a": RankingTier.NotForMe },
      };
      const [first, second] = computeTopPicks(allRankings, [optA, optB], 2);
      expect(first?.id).toBe("opt-a");
      expect(second?.id).toBe("opt-b");
    });

    it("returns only topCount options", () => {
      const allRankings = {
        "user-1": {
          "opt-a": RankingTier.LoveIt,
          "opt-b": RankingTier.Yes,
          "opt-c": RankingTier.Maybe,
          "opt-d": RankingTier.NotForMe,
        },
      };
      const result = computeTopPicks(allRankings, [optA, optB, optC, optD], 2);
      expect(result).toHaveLength(2);
      expect(result[0]?.id).toBe("opt-a");
      expect(result[1]?.id).toBe("opt-b");
    });
  });
});
