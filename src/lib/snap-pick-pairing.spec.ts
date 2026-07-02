import { describe, expect, it } from "vitest";

import { allMatchups, pairKey, remainingMatchups } from "./snap-pick-pairing";

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
