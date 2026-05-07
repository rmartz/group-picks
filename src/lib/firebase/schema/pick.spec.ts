import { describe, it, expect } from "vitest";
import {
  pickToFirebase,
  firebaseToPick,
  type FirebasePickPublic,
} from "./pick";
import { PickStatus } from "@/lib/types/pick";

const FIXED_DATE = new Date("2025-01-15T12:00:00.000Z");
const FIXED_TIMESTAMP = FIXED_DATE.getTime();
const DUE_DATE = new Date("2025-02-01T19:00:00.000Z");
const DUE_TIMESTAMP = DUE_DATE.getTime();

function makeFirebasePickPublic(
  overrides?: Partial<FirebasePickPublic>,
): FirebasePickPublic {
  return {
    title: "The Shawshank Redemption",
    description: "A classic film about hope",
    categoryId: "cat-123",
    status: PickStatus.Open,
    dueDate: DUE_TIMESTAMP,
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
      status: PickStatus.Open,
      dueDate: DUE_DATE,
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.title).toBe("The Shawshank Redemption");
    expect(result.description).toBe("A classic film about hope");
    expect(result.categoryId).toBe("cat-abc");
    expect(result.status).toBe(PickStatus.Open);
    expect(result.dueDate).toBe(DUE_TIMESTAMP);
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.creatorId).toBe("user-abc");
  });

  it("omits description when it is undefined", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: undefined,
      categoryId: "cat-abc",
      status: PickStatus.Open,
      dueDate: undefined,
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.description).toBeUndefined();
  });

  it("stores null for dueDate when absent", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: undefined,
      categoryId: "cat-abc",
      status: PickStatus.Open,
      dueDate: undefined,
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.dueDate).toBeNull();
  });

  it("stores closed status", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: undefined,
      categoryId: "cat-abc",
      status: PickStatus.Closed,
      dueDate: undefined,
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.status).toBe(PickStatus.Closed);
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
    expect(result.status).toBe(PickStatus.Open);
    expect(result.dueDate).toEqual(DUE_DATE);
    expect(result.createdAt).toEqual(FIXED_DATE);
    expect(result.creatorId).toBe("user-123");
  });

  it("returns undefined description when absent from Firebase data", () => {
    const data = makeFirebasePickPublic({ description: undefined });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.description).toBeUndefined();
  });

  it("returns undefined dueDate when absent from Firebase data", () => {
    const data = makeFirebasePickPublic({ dueDate: null });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.dueDate).toBeUndefined();
  });

  it("returns closed status from Firebase data", () => {
    const data = makeFirebasePickPublic({ status: PickStatus.Closed });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.status).toBe(PickStatus.Closed);
  });
});
