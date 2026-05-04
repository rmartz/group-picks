import { describe, it, expect } from "vitest";
import {
  categoryToFirebase,
  firebaseToCategory,
  type FirebaseCategory,
} from "./category";

const FIXED_DATE = new Date("2025-01-15T12:00:00.000Z");
const FIXED_TIMESTAMP = FIXED_DATE.getTime();

function makeFirebaseCategory(
  overrides?: Partial<FirebaseCategory>,
): FirebaseCategory {
  return {
    name: "Test Category",
    createdAt: FIXED_TIMESTAMP,
    creatorId: "user-123",
    ...overrides,
  };
}

describe("categoryToFirebase", () => {
  it("converts a category to Firebase format", () => {
    const result = categoryToFirebase({
      name: "My Category",
      description: undefined,
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.name).toBe("My Category");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.creatorId).toBe("user-abc");
  });

  it("includes description when provided", () => {
    const result = categoryToFirebase({
      name: "My Category",
      description: "A description",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.description).toBe("A description");
  });

  it("omits description when undefined", () => {
    const result = categoryToFirebase({
      name: "My Category",
      description: undefined,
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(Object.prototype.hasOwnProperty.call(result, "description")).toBe(
      false,
    );
  });
});

describe("firebaseToCategory", () => {
  it("converts Firebase data to a Category", () => {
    const data = makeFirebaseCategory({ description: "Some description" });

    const result = firebaseToCategory("cat-1", "group-1", data);

    expect(result.id).toBe("cat-1");
    expect(result.groupId).toBe("group-1");
    expect(result.name).toBe("Test Category");
    expect(result.description).toBe("Some description");
    expect(result.createdAt).toEqual(FIXED_DATE);
    expect(result.creatorId).toBe("user-123");
  });

  it("returns undefined description when absent", () => {
    const data = makeFirebaseCategory();

    const result = firebaseToCategory("cat-2", "group-1", data);

    expect(result.description).toBeUndefined();
  });
});
