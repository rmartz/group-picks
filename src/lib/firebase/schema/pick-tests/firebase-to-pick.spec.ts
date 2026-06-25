import { afterEach, describe, expect, it, vi } from "vitest";

import { RankingMode } from "@/lib/types/pick";

import { firebaseToPick } from "../pick";
import {
  CLOSED_DATE,
  CLOSED_TIMESTAMP,
  FIXED_DATE,
  FIXED_DUE_DATE,
  FIXED_TIMESTAMP,
  makeFirebasePickPublic,
} from "./fixtures";

describe("firebaseToPick", () => {
  it("converts Firebase data to a GroupPick", () => {
    const data = makeFirebasePickPublic();

    const result = firebaseToPick("pick-xyz", data);

    expect(result.id).toBe("pick-xyz");
    expect(result.title).toBe("The Shawshank Redemption");
    expect(result.description).toBe("A classic film about hope");
    expect(result.topCount).toBe(3);
    expect(result.dueDate).toEqual(FIXED_DUE_DATE);
    expect(result.categoryId).toBe("cat-123");
    expect(result.createdAt).toEqual(FIXED_DATE);
    expect(result.creatorId).toBe("user-123");
  });

  it("defaults missing optional fields", () => {
    const data = makeFirebasePickPublic({
      description: undefined,
      topCount: undefined,
      dueDate: undefined,
    });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.description).toBeUndefined();
    expect(result.topCount).toBe(1);
    expect(result.dueDate).toBeUndefined();
  });

  it("returns undefined options when absent from Firebase data", () => {
    const data = makeFirebasePickPublic({ options: undefined });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.options).toBeUndefined();
  });

  it("converts Firebase options to pick options", () => {
    const data = makeFirebasePickPublic({
      options: {
        "option-a": {
          ownerIds: ["user-123"],
          title: "Movie night",
        },
      },
    });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.options).toEqual([
      {
        id: "option-a",
        ownerIds: ["user-123"],
        title: "Movie night",
      },
    ]);
  });

  it("deserializes closedAt from a timestamp", () => {
    const data = makeFirebasePickPublic({ closedAt: CLOSED_TIMESTAMP });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.closedAt).toEqual(CLOSED_DATE);
  });

  it("returns undefined closedAt when absent from Firebase data", () => {
    const data = makeFirebasePickPublic({ closedAt: undefined });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.closedAt).toBeUndefined();
  });

  describe("when system time is fixed", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns undefined closedAt when timestamp is in the future", () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);

      const future = FIXED_TIMESTAMP + 5_000;
      const data = makeFirebasePickPublic({ closedAt: future });

      const result = firebaseToPick("pick-xyz", data);

      expect(result.closedAt).toBeUndefined();
    });
  });

  it("returns undefined closedAt when timestamp is invalid", () => {
    const data = makeFirebasePickPublic({ closedAt: Number.NaN });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.closedAt).toBeUndefined();
  });

  it("deserializes closedManually when present", () => {
    const data = makeFirebasePickPublic({ closedManually: true });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.closedManually).toBe(true);
  });

  it("returns undefined closedManually when absent from Firebase data", () => {
    const data = makeFirebasePickPublic({ closedManually: undefined });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.closedManually).toBeUndefined();
  });
});

describe("firebaseToPick resultsVisible", () => {
  it("deserializes resultsVisible when false", () => {
    const data = makeFirebasePickPublic({ resultsVisible: false });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.resultsVisible).toBe(false);
  });

  it("defaults resultsVisible to true when absent", () => {
    const data = makeFirebasePickPublic({ resultsVisible: undefined });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.resultsVisible).toBe(true);
  });
});

describe("firebaseToPick rankingMode", () => {
  it("deserializes rankingMode when present", () => {
    const data = makeFirebasePickPublic({
      rankingMode: RankingMode.TierBuckets,
    });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.rankingMode).toBe(RankingMode.TierBuckets);
  });

  it("defaults rankingMode to TierBuckets when absent", () => {
    const data = makeFirebasePickPublic({ rankingMode: undefined });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.rankingMode).toBe(RankingMode.TierBuckets);
  });
});

describe("firebaseToPick rejects malformed input", () => {
  it("throws when a required field is missing", () => {
    expect(() => firebaseToPick("pick-1", { title: "Orphan" })).toThrow();
  });

  it("throws when a field has the wrong type", () => {
    const data = { ...makeFirebasePickPublic(), createdAt: "not-a-number" };

    expect(() => firebaseToPick("pick-1", data)).toThrow();
  });
});
