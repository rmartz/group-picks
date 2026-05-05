import { describe, it, expect } from "vitest";
import {
  categoryToFirebase,
  firebaseToCategory,
  type FirebaseCategoryPublic,
} from "./category";

const FIXED_DATE = new Date("2025-03-10T09:00:00.000Z");
const FIXED_TIMESTAMP = FIXED_DATE.getTime();

function makeFirebaseCategoryPublic(
  overrides?: Partial<FirebaseCategoryPublic>,
): FirebaseCategoryPublic {
  return {
    groupId: "group-abc",
    name: "Best Movie",
    createdAt: FIXED_TIMESTAMP,
    ...overrides,
  };
}

describe("categoryToFirebase", () => {
  it("converts a category to Firebase format", () => {
    const result = categoryToFirebase({
      groupId: "group-xyz",
      name: "Best Restaurant",
      createdAt: FIXED_DATE,
    });

    expect(result.groupId).toBe("group-xyz");
    expect(result.name).toBe("Best Restaurant");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
  });
});

describe("firebaseToCategory", () => {
  it("converts Firebase data to a Category", () => {
    const data = makeFirebaseCategoryPublic();

    const result = firebaseToCategory("cat-1", data);

    expect(result.id).toBe("cat-1");
    expect(result.groupId).toBe("group-abc");
    expect(result.name).toBe("Best Movie");
    expect(result.createdAt).toEqual(FIXED_DATE);
  });

  it("converts Firebase data with a different name", () => {
    const data = makeFirebaseCategoryPublic({ name: "Best Song" });

    const result = firebaseToCategory("cat-2", data);

    expect(result.name).toBe("Best Song");
  });
});
