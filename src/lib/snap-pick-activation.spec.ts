import { describe, expect, it } from "vitest";

import type { SnapPickVote } from "@/lib/types/snap-pick";

import {
  computeClosesAt,
  computeSnapPickWinner,
  isDurationPreset,
  isPastDeadline,
} from "./snap-pick-activation";

function makeVote(
  overrides: Partial<SnapPickVote> & {
    winnerId: string;
    loserId: string;
  },
): SnapPickVote {
  return {
    id: "vote-1",
    votedBy: "user-1",
    votedAt: new Date("2025-03-20T12:00:00.000Z"),
    pairKey: [overrides.winnerId, overrides.loserId].sort().join("_"),
    ...overrides,
  };
}

describe("computeClosesAt", () => {
  it("resolves same-day to the upcoming local midnight", () => {
    const startedAt = new Date(2025, 2, 20, 14, 30, 0);
    const closesAt = computeClosesAt(startedAt, {
      kind: "preset",
      preset: "same-day",
    });
    expect(closesAt.getHours()).toBe(0);
    expect(closesAt.getMinutes()).toBe(0);
    expect(closesAt.getDate()).toBe(21);
  });

  it("adds one hour for the 1-hour preset", () => {
    const startedAt = new Date("2025-03-20T14:00:00.000Z");
    const closesAt = computeClosesAt(startedAt, {
      kind: "preset",
      preset: "1-hour",
    });
    expect(closesAt.toISOString()).toBe("2025-03-20T15:00:00.000Z");
  });

  it("adds four hours for the 4-hours preset", () => {
    const startedAt = new Date("2025-03-20T14:00:00.000Z");
    const closesAt = computeClosesAt(startedAt, {
      kind: "preset",
      preset: "4-hours",
    });
    expect(closesAt.toISOString()).toBe("2025-03-20T18:00:00.000Z");
  });

  it("adds the explicit span for a custom duration", () => {
    const startedAt = new Date("2025-03-20T14:00:00.000Z");
    const closesAt = computeClosesAt(startedAt, {
      kind: "custom",
      durationMs: 90 * 60 * 1000,
    });
    expect(closesAt.toISOString()).toBe("2025-03-20T15:30:00.000Z");
  });
});

describe("isDurationPreset", () => {
  it("accepts a known preset", () => {
    expect(isDurationPreset("2-hours")).toBe(true);
  });

  it("rejects an unknown value", () => {
    expect(isDurationPreset("8-hours")).toBe(false);
  });
});

describe("isPastDeadline", () => {
  it("is true when now is at or after the close time", () => {
    const closesAt = new Date("2025-03-20T14:00:00.000Z");
    expect(isPastDeadline(closesAt, new Date("2025-03-20T14:00:00.000Z"))).toBe(
      true,
    );
    expect(isPastDeadline(closesAt, new Date("2025-03-20T14:00:01.000Z"))).toBe(
      true,
    );
  });

  it("is false when now is before the close time", () => {
    const closesAt = new Date("2025-03-20T14:00:00.000Z");
    expect(isPastDeadline(closesAt, new Date("2025-03-20T13:59:59.000Z"))).toBe(
      false,
    );
  });
});

describe("computeSnapPickWinner", () => {
  it("returns the option with the most head-to-head wins", () => {
    const votes = [
      makeVote({ winnerId: "opt-b", loserId: "opt-a" }),
      makeVote({ winnerId: "opt-b", loserId: "opt-c" }),
      makeVote({ winnerId: "opt-a", loserId: "opt-c" }),
    ];
    expect(computeSnapPickWinner(votes, ["opt-a", "opt-b", "opt-c"])).toBe(
      "opt-b",
    );
  });

  it("breaks ties by option order (earliest option wins)", () => {
    const votes = [
      makeVote({ winnerId: "opt-a", loserId: "opt-c" }),
      makeVote({ winnerId: "opt-b", loserId: "opt-c" }),
    ];
    expect(computeSnapPickWinner(votes, ["opt-a", "opt-b", "opt-c"])).toBe(
      "opt-a",
    );
  });

  it("returns undefined when there are no votes even if options exist", () => {
    expect(computeSnapPickWinner([], ["opt-x", "opt-y"])).toBeUndefined();
  });

  it("returns undefined when there are no votes and no options", () => {
    expect(computeSnapPickWinner([], [])).toBeUndefined();
  });

  it("counts wins for an option removed from the current pool", () => {
    const votes = [
      makeVote({ winnerId: "opt-gone", loserId: "opt-a" }),
      makeVote({ winnerId: "opt-gone", loserId: "opt-a" }),
    ];
    expect(computeSnapPickWinner(votes, ["opt-a"])).toBe("opt-gone");
  });
});
