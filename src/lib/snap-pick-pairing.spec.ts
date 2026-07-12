import { describe, expect, it } from "vitest";

import {
  allMatchups,
  pairKey,
  relevantMatchups,
  remainingMatchups,
} from "./snap-pick-pairing";

describe("pairKey", () => {
  it("is identical regardless of argument order", () => {
    expect(pairKey("opt-b", "opt-a")).toBe(pairKey("opt-a", "opt-b"));
  });

  it("joins the sorted ids with an underscore", () => {
    expect(pairKey("opt-b", "opt-a")).toBe("opt-a_opt-b");
  });
});

describe("allMatchups", () => {
  it("produces every distinct unordered pair once", () => {
    expect(allMatchups(["a", "b", "c"])).toEqual([
      { a: "a", b: "b" },
      { a: "a", b: "c" },
      { a: "b", b: "c" },
    ]);
  });

  it("yields n*(n-1)/2 matchups for a pool of n options", () => {
    expect(allMatchups(["a", "b", "c", "d"])).toHaveLength(6);
  });

  it("returns no matchups when there are fewer than two options", () => {
    expect(allMatchups(["only"])).toEqual([]);
  });

  it("canonicalises each pair so a sorts before b", () => {
    expect(allMatchups(["c", "a"])).toEqual([{ a: "a", b: "c" }]);
  });
});

describe("remainingMatchups", () => {
  it("excludes pairs the member has already voted on", () => {
    const remaining = remainingMatchups(["a", "b", "c"], [pairKey("a", "b")]);

    expect(remaining).toEqual([
      { a: "a", b: "c" },
      { a: "b", b: "c" },
    ]);
  });

  it("returns the full round-robin set when nothing has been voted on", () => {
    expect(remainingMatchups(["a", "b", "c"], [])).toEqual(
      allMatchups(["a", "b", "c"]),
    );
  });

  it("returns an empty queue once every pair has been decided", () => {
    const cast = [pairKey("a", "b"), pairKey("a", "c"), pairKey("b", "c")];

    expect(remainingMatchups(["a", "b", "c"], cast)).toEqual([]);
  });

  it("ignores cast keys for pairs no longer in the pool", () => {
    const remaining = remainingMatchups(["a", "b"], [pairKey("a", "gone")]);

    expect(remaining).toEqual([{ a: "a", b: "b" }]);
  });
});

describe("relevantMatchups", () => {
  it("drops matchups for a clearly-low-relevance option", () => {
    const ratings = {
      a: { rating: 1200, games: 8 },
      b: { rating: 1150, games: 8 },
      c: { rating: 850, games: 8 },
    };

    const matchups = relevantMatchups(["a", "b", "c"], ratings, []);

    expect(matchups).toEqual([{ a: "a", b: "b" }]);
  });

  it("keeps a cold-start option in the queue alongside rated ones", () => {
    const ratings = { a: { rating: 1300, games: 8 } };

    const matchups = relevantMatchups(["a", "b"], ratings, []);

    expect(matchups).toEqual([{ a: "a", b: "b" }]);
  });

  it("falls back to the full round-robin when the model is empty", () => {
    expect(relevantMatchups(["a", "b", "c"], {}, [])).toEqual(
      allMatchups(["a", "b", "c"]),
    );
  });

  it("still excludes pairs the member has already voted on", () => {
    const matchups = relevantMatchups(["a", "b", "c"], {}, [pairKey("a", "b")]);

    expect(matchups).toEqual([
      { a: "a", b: "c" },
      { a: "b", b: "c" },
    ]);
  });
});
