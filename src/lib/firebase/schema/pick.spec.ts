import { describe, it, expect } from "vitest";
import { PickStatus } from "@/lib/types/pick";
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
    categoryId: "cat-123",
    closedAt: undefined,
    createdAt: FIXED_TIMESTAMP,
    creatorId: "user-123",
    description: "A classic film about hope",
    status: PickStatus.Open,
    title: "The Shawshank Redemption",
    ...overrides,
  };
}

describe("pickToFirebase", () => {
  it("converts a pick to Firebase format", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: "A classic film about hope",
      categoryId: "cat-abc",
      closedAt: undefined,
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      status: PickStatus.Open,
    });

    expect(result.title).toBe("The Shawshank Redemption");
    expect(result.description).toBe("A classic film about hope");
    expect(result.categoryId).toBe("cat-abc");
    expect(result.closedAt).toBeUndefined();
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.creatorId).toBe("user-abc");
    expect(result.status).toBe(PickStatus.Open);
  });

  it("omits description when it is undefined", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: undefined,
      categoryId: "cat-abc",
      closedAt: undefined,
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      status: PickStatus.Open,
    });

    expect(result.description).toBeUndefined();
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
    expect(result.closedAt).toBeUndefined();
    expect(result.createdAt).toEqual(FIXED_DATE);
    expect(result.creatorId).toBe("user-123");
    expect(result.status).toBe(PickStatus.Open);
  });

  it("returns undefined description when absent from Firebase data", () => {
    const data = makeFirebasePickPublic({ description: undefined });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.description).toBeUndefined();
  });

  it("defaults status to open when absent from Firebase data", () => {
    const data = makeFirebasePickPublic({ status: undefined });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.status).toBe(PickStatus.Open);
  });

  it("converts closedAt timestamp when provided", () => {
    const data = makeFirebasePickPublic({ closedAt: FIXED_TIMESTAMP });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.closedAt).toEqual(FIXED_DATE);
  });

  it("returns undefined closedAt when timestamp is in the future", () => {
    const future = Date.now() + 5_000;
    const data = makeFirebasePickPublic({ closedAt: future });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.closedAt).toBeUndefined();
  });

  it("returns undefined closedAt when timestamp is invalid", () => {
    const data = makeFirebasePickPublic({ closedAt: Number.NaN });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.closedAt).toBeUndefined();
  });
});
