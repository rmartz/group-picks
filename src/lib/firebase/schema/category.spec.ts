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
    groupId: "group-123",
    name: "Best Movie",
    createdAt: FIXED_TIMESTAMP,
    ...overrides,
  };
}

describe("categoryToFirebase", () => {
  it("converts a category to Firebase format", () => {
    const result = categoryToFirebase({
      groupId: "group-abc",
      name: "Best Movie",
      createdAt: FIXED_DATE,
    });

    expect(result.groupId).toBe("group-abc");
    expect(result.name).toBe("Best Movie");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
  });
});

describe("firebaseToCategory", () => {
  it("converts Firebase data to a Category", () => {
    const data = makeFirebaseCategoryPublic();
    const result = firebaseToCategory("category-xyz", data);

    expect(result.id).toBe("category-xyz");
    expect(result.groupId).toBe("group-123");
    expect(result.name).toBe("Best Movie");
    expect(result.createdAt).toEqual(FIXED_DATE);
  });
});
