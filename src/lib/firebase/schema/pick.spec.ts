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
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.title).toBe("The Shawshank Redemption");
    expect(result.description).toBe("A classic film about hope");
    expect(result.categoryId).toBe("cat-abc");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.creatorId).toBe("user-abc");
  });

  it("converts due date and closed date to Firebase timestamps", () => {
    const dueDate = new Date("2025-01-20T12:00:00.000Z");
    const closedAt = new Date("2025-01-21T15:30:00.000Z");

    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: "A classic film about hope",
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      dueDate,
      closedAt,
    });

    expect(result.dueDate).toBe(dueDate.getTime());
    expect(result.closedAt).toBe(closedAt.getTime());
  });

  it("omits description when it is undefined", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: undefined,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.description).toBeUndefined();
  });

  it("serializes closedManually when provided", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      closedManually: true,
    });

    expect(result.closedManually).toBe(true);
  });

  it("omits closedManually when undefined", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      closedManually: undefined,
    });

    expect(result.closedManually).toBeUndefined();
  });
});

describe("firebaseToPick", () => {
  it("converts Firebase data to a GroupPick", () => {
    const data = makeFirebasePickPublic();

    const result = firebaseToPick("pick-xyz", data);

    expect(result.id).toBe("pick-xyz");
    expect(result.title).toBe("The Shawshank Redemption");
    expect(result.description).toBe("A classic film about hope");
    expect(result.categoryId).toBe("cat-123");
    expect(result.createdAt).toEqual(FIXED_DATE);
    expect(result.creatorId).toBe("user-123");
  });

  it("converts due date and closed date when present", () => {
    const dueDate = new Date("2025-01-20T12:00:00.000Z");
    const closedAt = new Date("2025-01-21T15:30:00.000Z");
    const data = makeFirebasePickPublic({
      dueDate: dueDate.getTime(),
      closedAt: closedAt.getTime(),
    });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.dueDate).toEqual(dueDate);
    expect(result.closedAt).toEqual(closedAt);
  });

  it("returns undefined description when absent from Firebase data", () => {
    const data = makeFirebasePickPublic({ description: undefined });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.description).toBeUndefined();
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
