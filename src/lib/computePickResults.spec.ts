import { describe, expect, it } from "vitest";

import type { Option } from "@/lib/types/option";

import { computePickResults } from "./computePickResults";

function makeOption(id: string, ownerCount: number, title?: string): Option {
  return {
    id,
    title: title ?? `Option ${id}`,
    pickId: "pick-1",
    ownerIds: Array.from({ length: ownerCount }, (_, i) => `user-${i}`),
  };
}

describe("computePickResults — empty input", () => {
  it("returns empty arrays for no options", () => {
    const { topPicks, runnersUp } = computePickResults([], 3);
    expect(topPicks).toHaveLength(0);
    expect(runnersUp).toHaveLength(0);
  });
});

describe("computePickResults — score assignment", () => {
  it("sets score equal to ownerIds.length", () => {
    const { topPicks } = computePickResults([makeOption("a", 3)], 3);
    expect(topPicks[0]?.score).toBe(3);
  });
});

describe("computePickResults — rank assignment (no ties)", () => {
  it("assigns rank 1 to the highest-scoring option", () => {
    const options = [makeOption("a", 3), makeOption("b", 2)];
    const { topPicks } = computePickResults(options, 3);
    const entry = topPicks.find((e) => e.option.id === "a");
    expect(entry?.rank).toBe(1);
  });

  it("assigns sequential ranks when all scores differ", () => {
    const options = [
      makeOption("a", 3),
      makeOption("b", 2),
      makeOption("c", 1),
    ];
    const { topPicks } = computePickResults(options, 3);
    const byId = Object.fromEntries(topPicks.map((e) => [e.option.id, e.rank]));
    expect(byId).toEqual({ a: 1, b: 2, c: 3 });
  });
});

describe("computePickResults — tie handling", () => {
  it("assigns the same rank to options with equal scores", () => {
    const options = [
      makeOption("a", 2),
      makeOption("b", 2),
      makeOption("c", 1),
    ];
    const { topPicks } = computePickResults(options, 3);
    const aEntry = topPicks.find((e) => e.option.id === "a");
    const bEntry = topPicks.find((e) => e.option.id === "b");
    expect(aEntry?.rank).toBe(bEntry?.rank);
  });

  it("skips the rank after a tie (two tied at #1 means next is #3)", () => {
    const options = [
      makeOption("a", 2),
      makeOption("b", 2),
      makeOption("c", 1),
    ];
    const { topPicks, runnersUp } = computePickResults(options, 3);
    const cEntry = [...topPicks, ...runnersUp].find((e) => e.option.id === "c");
    expect(cEntry?.rank).toBe(3);
  });
});

describe("computePickResults — top picks vs runners-up split", () => {
  it("puts options with rank <= topCount in topPicks", () => {
    const options = [
      makeOption("a", 3),
      makeOption("b", 2),
      makeOption("c", 1),
    ];
    const { topPicks } = computePickResults(options, 2);
    expect(topPicks.map((e) => e.option.id)).toContain("a");
    expect(topPicks.map((e) => e.option.id)).toContain("b");
  });

  it("puts options with rank > topCount in runnersUp", () => {
    const options = [
      makeOption("a", 3),
      makeOption("b", 2),
      makeOption("c", 1),
    ];
    const { runnersUp } = computePickResults(options, 2);
    expect(runnersUp.map((e) => e.option.id)).toContain("c");
  });

  it("expands topPicks past topCount when a tie spans the boundary", () => {
    // topCount=2, but ranks are: a=1, b=2, c=2 — tie at rank 2 means all 3 in topPicks
    const options = [
      makeOption("a", 3),
      makeOption("b", 2),
      makeOption("c", 2),
    ];
    const { topPicks, runnersUp } = computePickResults(options, 2);
    expect(topPicks).toHaveLength(3);
    expect(runnersUp).toHaveLength(0);
  });

  it("all options in topPicks when topCount >= option count", () => {
    const options = [makeOption("a", 3), makeOption("b", 2)];
    const { topPicks, runnersUp } = computePickResults(options, 5);
    expect(topPicks).toHaveLength(2);
    expect(runnersUp).toHaveLength(0);
  });
});

describe("computePickResults — ordering", () => {
  it("orders topPicks by rank ascending", () => {
    const options = [
      makeOption("a", 1),
      makeOption("b", 3),
      makeOption("c", 2),
    ];
    const { topPicks } = computePickResults(options, 3);
    const ranks = topPicks.map((e) => e.rank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("breaks ties alphabetically by title", () => {
    const options = [makeOption("b", 2, "Banana"), makeOption("a", 2, "Apple")];
    const { topPicks } = computePickResults(options, 2);
    expect(topPicks[0]?.option.title).toBe("Apple");
    expect(topPicks[1]?.option.title).toBe("Banana");
  });
});
