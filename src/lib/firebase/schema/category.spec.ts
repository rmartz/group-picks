import { describe, it, expect } from "vitest";
import {
  categoryToFirebase,
  firebaseToCategory,
  type FirebaseCategoryPublic,
} from "./category";

const FIXED_DATE = new Date("2025-03-10T09:00:00.000Z");
const FIXED_TIMESTAMP = FIXED_DATE.getTime();
const CLOSES_AT = new Date("2025-03-17T09:00:00.000Z");
const CLOSED_AT = new Date("2025-03-17T11:00:00.000Z");

function makeFirebaseCategoryPublic(
  overrides?: Partial<FirebaseCategoryPublic>,
): FirebaseCategoryPublic {
  return {
    name: "Best Movies",
    description: "Vote on the best movies",
    groupId: "group-1",
    createdAt: FIXED_TIMESTAMP,
    creatorId: "user-123",
    topPickCount: 3,
    rankedBallots: [
      ["pick-1", "pick-2"],
      ["pick-2", "pick-1"],
    ],
    rankedCount: 2,
    totalCount: 4,
    closesAt: CLOSES_AT.getTime(),
    closedAt: CLOSED_AT.getTime(),
    ...overrides,
  };
}

describe("categoryToFirebase", () => {
  it("converts a category to Firebase format", () => {
    const result = categoryToFirebase({
      groupId: "group-1",
      name: "Best Movies",
      description: "Vote on the best movies",
      createdAt: FIXED_DATE,
      creatorId: "user-123",
      topPickCount: 3,
      rankedBallots: [["pick-1", "pick-2"]],
      rankedCount: 1,
      totalCount: 3,
      closesAt: CLOSES_AT,
      closedAt: CLOSED_AT,
    });

    expect(result.groupId).toBe("group-1");
    expect(result.name).toBe("Best Movies");
    expect(result.description).toBe("Vote on the best movies");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.creatorId).toBe("user-123");
    expect(result.topPickCount).toBe(3);
    expect(result.rankedBallots).toEqual([["pick-1", "pick-2"]]);
    expect(result.rankedCount).toBe(1);
    expect(result.totalCount).toBe(3);
    expect(result.closesAt).toBe(CLOSES_AT.getTime());
    expect(result.closedAt).toBe(CLOSED_AT.getTime());
  });

  it("omits description when it is undefined", () => {
    const result = categoryToFirebase({
      name: "Best Movies",
      description: undefined,
      groupId: "group-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.description).toBeUndefined();
  });
});

describe("firebaseToCategory", () => {
  it("converts Firebase data to a Category", () => {
    const data = makeFirebaseCategoryPublic();
    const result = firebaseToCategory("cat-1", data);

    expect(result.id).toBe("cat-1");
    expect(result.groupId).toBe("group-1");
    expect(result.name).toBe("Best Movies");
    expect(result.description).toBe("Vote on the best movies");
    expect(result.createdAt).toEqual(FIXED_DATE);
    expect(result.creatorId).toBe("user-123");
    expect(result.topPickCount).toBe(3);
    expect(result.rankedBallots).toEqual([
      ["pick-1", "pick-2"],
      ["pick-2", "pick-1"],
    ]);
    expect(result.rankedCount).toBe(2);
    expect(result.totalCount).toBe(4);
    expect(result.closesAt).toEqual(CLOSES_AT);
    expect(result.closedAt).toEqual(CLOSED_AT);
  });

  it("returns undefined description when absent from Firebase data", () => {
    const data = makeFirebaseCategoryPublic({ description: undefined });

    const result = firebaseToCategory("cat-xyz", data);

    expect(result.description).toBeUndefined();
  });

  it("round-trips through Firebase format", () => {
    const original = {
      groupId: "group-abc",
      name: "Top Albums",
      description: "The greatest albums of all time",
      createdAt: FIXED_DATE,
      creatorId: "user-456",
    };

    const firebase = categoryToFirebase(original);
    const result = firebaseToCategory("cat-2", firebase);

    expect(result.groupId).toBe(original.groupId);
    expect(result.name).toBe(original.name);
    expect(result.description).toBe(original.description);
    expect(result.createdAt).toEqual(original.createdAt);
    expect(result.creatorId).toBe(original.creatorId);
  });
});
