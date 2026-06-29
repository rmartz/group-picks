import { describe, expect, it } from "vitest";

import { RankingMode } from "@/lib/types/pick";

import { pickToFirebase } from "../pick";
import {
  CLOSED_DATE,
  CLOSED_TIMESTAMP,
  FIXED_DATE,
  FIXED_DUE_DATE,
  FIXED_TIMESTAMP,
} from "./fixtures";

describe("pickToFirebase", () => {
  it("converts a pick to Firebase format", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: "A classic film about hope",
      topCount: 3,
      dueDate: FIXED_DUE_DATE,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.title).toBe("The Shawshank Redemption");
    expect(result.description).toBe("A classic film about hope");
    expect(result.topCount).toBe(3);
    expect(result.dueDate).toBe(FIXED_DUE_DATE.getTime());
    expect(result.categoryId).toBe("cat-abc");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.creatorId).toBe("user-abc");
  });

  it("converts options and owner IDs to Firebase format", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: "A classic film about hope",
      topCount: 3,
      dueDate: FIXED_DUE_DATE,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      options: [
        {
          id: "option-a",
          ownerIds: ["user-abc", "user-def"],
          title: "Movie night",
        },
      ],
    });

    expect(result.options).toEqual({
      "option-a": {
        ownerIds: ["user-abc", "user-def"],
        title: "Movie night",
      },
    });
  });

  it("omits optional fields when they are undefined", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: undefined,
      topCount: 2,
      dueDate: undefined,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      options: undefined,
    });

    expect(result.description).toBeUndefined();
    expect(result.dueDate).toBeUndefined();
  });

  it("returns undefined options when they are not provided", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: "A classic film about hope",
      topCount: 1,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      options: undefined,
    });

    expect(result.options).toBeUndefined();
  });

  it("serializes closedAt as a timestamp when provided", () => {
    const result = pickToFirebase({
      title: "Movie",
      topCount: 1,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      closedAt: CLOSED_DATE,
    });

    expect(result.closedAt).toBe(CLOSED_TIMESTAMP);
  });

  it("omits closedAt when undefined", () => {
    const result = pickToFirebase({
      title: "Movie",
      topCount: 1,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      closedAt: undefined,
    });

    expect(result.closedAt).toBeUndefined();
  });

  it("serializes closedManually when provided", () => {
    const result = pickToFirebase({
      title: "Movie",
      topCount: 1,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      closedManually: true,
    });

    expect(result.closedManually).toBe(true);
  });

  it("omits closedManually when undefined", () => {
    const result = pickToFirebase({
      title: "Movie",
      topCount: 1,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      closedManually: undefined,
    });

    expect(result.closedManually).toBeUndefined();
  });
});

describe("pickToFirebase rankingMode", () => {
  it("serializes rankingMode when provided", () => {
    const result = pickToFirebase({
      title: "Movie",
      topCount: 1,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      rankingMode: RankingMode.TierBuckets,
    });

    expect(result.rankingMode).toBe(RankingMode.TierBuckets);
  });

  it("omits rankingMode when undefined", () => {
    const result = pickToFirebase({
      title: "Movie",
      topCount: 1,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      rankingMode: undefined,
    });

    expect(result.rankingMode).toBeUndefined();
  });
});
