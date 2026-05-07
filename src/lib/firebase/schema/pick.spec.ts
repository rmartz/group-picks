import { describe, it, expect } from "vitest";
import {
  pickToFirebase,
  firebaseToPick,
  type FirebasePickPublic,
} from "./pick";

const FIXED_DATE = new Date("2025-01-15T12:00:00.000Z");
const FIXED_TIMESTAMP = FIXED_DATE.getTime();

function makeFirebasePickPublic(
  overrides?: Partial<FirebasePickPublic>,
): FirebasePickPublic {
  return {
    title: "The Shawshank Redemption",
    description: "A classic film about hope",
    dueAt: FIXED_TIMESTAMP + 86400000,
    topCount: 5,
    categoryId: "cat-123",
    createdAt: FIXED_TIMESTAMP,
    creatorId: "user-123",
    ...overrides,
  };
}

describe("pickToFirebase", () => {
  it("converts a pick to Firebase format", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: "A classic film about hope",
      dueAt: new Date(FIXED_TIMESTAMP + 86400000),
      topCount: 3,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.title).toBe("The Shawshank Redemption");
    expect(result.description).toBe("A classic film about hope");
    expect(result.dueAt).toBe(FIXED_TIMESTAMP + 86400000);
    expect(result.topCount).toBe(3);
    expect(result.categoryId).toBe("cat-abc");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.creatorId).toBe("user-abc");
  });

  it("omits description when it is undefined", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: undefined,
      dueAt: undefined,
      topCount: 4,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.description).toBeUndefined();
    expect(result.dueAt).toBeUndefined();
  });
});

describe("firebaseToPick", () => {
  it("converts Firebase data to a GroupPick", () => {
    const data = makeFirebasePickPublic();

    const result = firebaseToPick("pick-xyz", data);

    expect(result.id).toBe("pick-xyz");
    expect(result.title).toBe("The Shawshank Redemption");
    expect(result.description).toBe("A classic film about hope");
    expect(result.dueAt).toEqual(new Date(FIXED_TIMESTAMP + 86400000));
    expect(result.topCount).toBe(5);
    expect(result.categoryId).toBe("cat-123");
    expect(result.createdAt).toEqual(FIXED_DATE);
    expect(result.creatorId).toBe("user-123");
  });

  it("returns undefined description when absent from Firebase data", () => {
    const data = makeFirebasePickPublic({
      description: undefined,
      dueAt: undefined,
    });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.description).toBeUndefined();
    expect(result.dueAt).toBeUndefined();
  });
});
