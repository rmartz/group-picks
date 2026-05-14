import { describe, expect, it } from "vitest";

import {
  categoryToFirebase,
  type FirebaseCategoryPublic,
  firebaseToCategory,
} from "./category";

const FIXED_DATE = new Date("2025-03-10T09:00:00.000Z");
const FIXED_TIMESTAMP = FIXED_DATE.getTime();

function makeFirebaseCategoryPublic(
  overrides?: Partial<FirebaseCategoryPublic>,
): FirebaseCategoryPublic {
  return {
    name: "Best Movies",
    description: "Vote on the best movies",
    groupId: "group-1",
    createdAt: FIXED_TIMESTAMP,
    creatorId: "user-123",
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
    });

    expect(result.groupId).toBe("group-1");
    expect(result.name).toBe("Best Movies");
    expect(result.description).toBe("Vote on the best movies");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.creatorId).toBe("user-123");
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
