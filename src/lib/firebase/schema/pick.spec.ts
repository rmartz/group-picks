import { describe, it, expect } from "vitest";
import {
  pickToFirebase,
  firebaseToPick,
  type FirebasePickPublic,
} from "./pick";

const FIXED_DATE = new Date("2025-01-15T12:00:00.000Z");
const FIXED_TIMESTAMP = FIXED_DATE.getTime();
const FIXED_DUE_DATE = new Date("2025-02-01T09:30:00.000Z");

function makeFirebasePickPublic(
  overrides?: Partial<FirebasePickPublic>,
): FirebasePickPublic {
  return {
    title: "The Shawshank Redemption",
    description: "A classic film about hope",
    topCount: 3,
    dueDate: FIXED_DUE_DATE.getTime(),
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

  it("omits optional fields when they are undefined", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: undefined,
      topCount: 2,
      dueDate: undefined,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.description).toBeUndefined();
    expect(result.dueDate).toBeUndefined();
  });
});

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
});
