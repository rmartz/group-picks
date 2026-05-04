import { describe, it, expect } from "vitest";
import {
  categoryToFirebase,
  firebaseToCategory,
  type FirebaseCategoryPublic,
} from "./category";

const FIXED_DATE = new Date("2025-01-15T12:00:00.000Z");
const FIXED_TIMESTAMP = FIXED_DATE.getTime();

function makeFirebaseCategoryPublic(
  overrides?: Partial<FirebaseCategoryPublic>,
): FirebaseCategoryPublic {
  return {
    name: "Best Movies",
    description: "Pick your favourite movie of the year",
    groupId: "group-123",
    createdAt: FIXED_TIMESTAMP,
    creatorId: "user-123",
    ...overrides,
  };
}

describe("categoryToFirebase", () => {
  it("converts a category to Firebase format", () => {
    const result = categoryToFirebase({
      name: "Best Movies",
      description: "Pick your favourite movie of the year",
      groupId: "group-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.name).toBe("Best Movies");
    expect(result.description).toBe("Pick your favourite movie of the year");
    expect(result.groupId).toBe("group-abc");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.creatorId).toBe("user-abc");
  });
});

describe("firebaseToCategory", () => {
  it("converts Firebase data to a Category", () => {
    const data = makeFirebaseCategoryPublic();

    const result = firebaseToCategory("cat-xyz", data);

    expect(result.id).toBe("cat-xyz");
    expect(result.name).toBe("Best Movies");
    expect(result.description).toBe("Pick your favourite movie of the year");
    expect(result.groupId).toBe("group-123");
    expect(result.createdAt).toEqual(FIXED_DATE);
    expect(result.creatorId).toBe("user-123");
  });
});
