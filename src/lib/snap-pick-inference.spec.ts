import { describe, expect, it } from "vitest";

import {
  applyVote,
  ELO_K,
  focusRelevantOptions,
  getRating,
  isLowRelevance,
  NEUTRAL_RATING,
  pairUncertainty,
  rankByRelevance,
} from "./snap-pick-inference";

describe("getRating", () => {
  it("returns the stored rating for a known option", () => {
    const ratings = { "opt-a": { rating: 1234, games: 7 } };

    expect(getRating(ratings, "opt-a")).toEqual({ rating: 1234, games: 7 });
  });

  it("falls back to the neutral cold-start rating for an unknown option", () => {
    expect(getRating({}, "opt-a")).toEqual({
      rating: NEUTRAL_RATING,
      games: 0,
    });
  });
});

describe("applyVote", () => {
  it("moves an even matchup by half the K-factor and increments games", () => {
    const updated = applyVote({}, "opt-a", "opt-b");

    expect(updated).toEqual({
      "opt-a": { rating: NEUTRAL_RATING + ELO_K / 2, games: 1 },
      "opt-b": { rating: NEUTRAL_RATING - ELO_K / 2, games: 1 },
    });
  });

  it("rewards an underdog win more than a favourite win", () => {
    const ratings = {
      strong: { rating: 1200, games: 10 },
      weak: { rating: 800, games: 10 },
    };

    const upset = applyVote(ratings, "weak", "strong");
    const expected = applyVote(ratings, "strong", "weak");

    const upsetGain = getRating(upset, "weak").rating - 800;
    const expectedGain = getRating(expected, "strong").rating - 1200;
    expect(upsetGain).toBeGreaterThan(ELO_K / 2);
    expect(expectedGain).toBeLessThan(ELO_K / 2);
  });

  it("conserves rating mass between the two options", () => {
    const ratings = {
      strong: { rating: 1200, games: 4 },
      weak: { rating: 950, games: 4 },
    };

    const updated = applyVote(ratings, "strong", "weak");
    const winnerGain = getRating(updated, "strong").rating - 1200;
    const loserLoss = 950 - getRating(updated, "weak").rating;
    expect(winnerGain).toBeCloseTo(loserLoss, 10);
  });

  it("touches only the winner and loser, leaving the rest of the pool untouched", () => {
    const ratings = {
      "opt-a": { rating: 1100, games: 3 },
      "opt-b": { rating: 900, games: 3 },
      "opt-c": { rating: 1000, games: 3 },
    };

    const updated = applyVote(ratings, "opt-a", "opt-b");

    expect(updated["opt-c"]).toBeUndefined();
    expect(Object.keys(updated)).toEqual(["opt-a", "opt-b"]);
  });
});

describe("rankByRelevance", () => {
  it("orders options from most to least relevant by rating", () => {
    const ratings = {
      low: { rating: 800, games: 5 },
      high: { rating: 1300, games: 5 },
      mid: { rating: 1000, games: 5 },
    };

    const ranked = rankByRelevance(["low", "high", "mid"], ratings);

    expect(ranked.map((option) => option.optionId)).toEqual([
      "high",
      "mid",
      "low",
    ]);
  });

  it("exposes games played as the uncertainty signal alongside the rating", () => {
    const ranked = rankByRelevance(["opt-a"], {
      "opt-a": { rating: 1300, games: 9 },
    });

    expect(ranked[0]).toEqual({ optionId: "opt-a", rating: 1300, games: 9 });
  });

  it("treats unrated options as neutral cold-start and keeps input order on ties", () => {
    const ranked = rankByRelevance(["opt-a", "opt-b"], {});

    expect(ranked).toEqual([
      { optionId: "opt-a", rating: NEUTRAL_RATING, games: 0 },
      { optionId: "opt-b", rating: NEUTRAL_RATING, games: 0 },
    ]);
  });
});

describe("isLowRelevance", () => {
  it("flags an option that is clearly below neutral with enough games", () => {
    expect(isLowRelevance({ rating: 900, games: 6 })).toBe(true);
  });

  it("keeps a cold-start option even when its rating is low", () => {
    expect(isLowRelevance({ rating: 900, games: 1 })).toBe(false);
  });

  it("keeps an option whose rating is only marginally below neutral", () => {
    expect(isLowRelevance({ rating: NEUTRAL_RATING - 10, games: 6 })).toBe(
      false,
    );
  });
});

describe("focusRelevantOptions", () => {
  it("prunes clearly-low-relevance options and orders the rest by relevance", () => {
    const ratings = {
      margherita: { rating: 1200, games: 8 },
      pepperoni: { rating: 1150, games: 8 },
      eggplant: { rating: 850, games: 8 },
    };

    const focused = focusRelevantOptions(
      ["margherita", "pepperoni", "eggplant"],
      ratings,
    );

    expect(focused).toEqual(["margherita", "pepperoni"]);
  });

  it("keeps a cold-start option eligible even beside strong ones", () => {
    const ratings = { strong: { rating: 1300, games: 8 } };

    const focused = focusRelevantOptions(["strong", "newbie"], ratings);

    expect(focused).toEqual(["strong", "newbie"]);
  });

  it("never prunes the pool below two options", () => {
    const ratings = {
      "opt-a": { rating: 900, games: 8 },
      "opt-b": { rating: 850, games: 8 },
      "opt-c": { rating: 800, games: 8 },
    };

    const focused = focusRelevantOptions(["opt-a", "opt-b", "opt-c"], ratings);

    expect(focused).toEqual(["opt-a", "opt-b", "opt-c"]);
  });
});

describe("pairUncertainty", () => {
  it("reports the rating gap and the smaller of the two games counts", () => {
    const ratings = {
      "opt-a": { rating: 1200, games: 9 },
      "opt-b": { rating: 950, games: 4 },
    };

    expect(pairUncertainty(ratings, "opt-a", "opt-b")).toEqual({
      ratingGap: 250,
      games: 4,
    });
  });

  it("treats unrated options as neutral cold-start with zero games", () => {
    expect(pairUncertainty({}, "opt-a", "opt-b")).toEqual({
      ratingGap: 0,
      games: 0,
    });
  });
});
