import { describe, it, expect, afterEach, vi } from "vitest";
import {
  pickToFirebase,
  firebaseToPick,
  removeOwnerFromPickOptions,
  type FirebasePickPublic,
} from "./pick";

const FIXED_DATE = new Date("2025-01-15T12:00:00.000Z");
const FIXED_TIMESTAMP = FIXED_DATE.getTime();
const FIXED_DUE_DATE = new Date("2025-02-01T09:30:00.000Z");

const CLOSED_DATE = new Date("2025-02-01T09:00:00.000Z");
const CLOSED_TIMESTAMP = CLOSED_DATE.getTime();

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

  it("converts options and owner IDs to Firebase format", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: "A classic film about hope",
      topCount: 3,
      dueDate: FIXED_DUE_DATE,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      options: [
        {
          id: "option-a",
          ownerIds: ["user-abc", "user-def"],
          title: "Movie night",
        },
      ],
    });

    expect(result.options).toEqual({
      "option-a": {
        ownerIds: ["user-abc", "user-def"],
        title: "Movie night",
      },
    });
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
      options: undefined,
    });

    expect(result.description).toBeUndefined();
    expect(result.dueDate).toBeUndefined();
  });

  it("returns undefined options when they are not provided", () => {
    const result = pickToFirebase({
      title: "The Shawshank Redemption",
      description: "A classic film about hope",
      topCount: 1,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      options: undefined,
    });

    expect(result.options).toBeUndefined();
  });

  it("serializes closedAt as a timestamp when provided", () => {
    const result = pickToFirebase({
      title: "Movie",
      topCount: 1,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      closedAt: CLOSED_DATE,
    });

    expect(result.closedAt).toBe(CLOSED_TIMESTAMP);
  });

  it("omits closedAt when undefined", () => {
    const result = pickToFirebase({
      title: "Movie",
      topCount: 1,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      closedAt: undefined,
    });

    expect(result.closedAt).toBeUndefined();
  });

  it("serializes closedManually when provided", () => {
    const result = pickToFirebase({
      title: "Movie",
      topCount: 1,
      categoryId: "cat-abc",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      closedManually: true,
    });

    expect(result.closedManually).toBe(true);
  });

  it("omits closedManually when undefined", () => {
    const result = pickToFirebase({
      title: "Movie",
      topCount: 1,
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

  it("returns undefined options when absent from Firebase data", () => {
    const data = makeFirebasePickPublic({ options: undefined });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.options).toBeUndefined();
  });

  it("converts Firebase options to pick options", () => {
    const data = makeFirebasePickPublic({
      options: {
        "option-a": {
          ownerIds: ["user-123"],
          title: "Movie night",
        },
      },
    });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.options).toEqual([
      {
        id: "option-a",
        ownerIds: ["user-123"],
        title: "Movie night",
      },
    ]);
  });

  it("deserializes closedAt from a timestamp", () => {
    const data = makeFirebasePickPublic({ closedAt: CLOSED_TIMESTAMP });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.closedAt).toEqual(CLOSED_DATE);
  });

  it("returns undefined closedAt when absent from Firebase data", () => {
    const data = makeFirebasePickPublic({ closedAt: undefined });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.closedAt).toBeUndefined();
  });

  describe("when system time is fixed", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns undefined closedAt when timestamp is in the future", () => {
      vi.useFakeTimers();
      vi.setSystemTime(FIXED_DATE);

      const future = FIXED_TIMESTAMP + 5_000;
      const data = makeFirebasePickPublic({ closedAt: future });

      const result = firebaseToPick("pick-xyz", data);

      expect(result.closedAt).toBeUndefined();
    });
  });

  it("returns undefined closedAt when timestamp is invalid", () => {
    const data = makeFirebasePickPublic({ closedAt: Number.NaN });

    const result = firebaseToPick("pick-xyz", data);

    expect(result.closedAt).toBeUndefined();
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

describe("removeOwnerFromPickOptions", () => {
  it("removes the owner from the option owner list", () => {
    const result = removeOwnerFromPickOptions(
      [
        {
          id: "option-a",
          ownerIds: ["user-123", "user-456"],
          title: "Movie night",
        },
      ],
      "option-a",
      "user-456",
    );

    expect(result).toEqual([
      {
        id: "option-a",
        ownerIds: ["user-123"],
        title: "Movie night",
      },
    ]);
  });

  it("deletes the option when no owners remain", () => {
    const result = removeOwnerFromPickOptions(
      [
        {
          id: "option-a",
          ownerIds: ["user-123"],
          title: "Movie night",
        },
      ],
      "option-a",
      "user-123",
    );

    expect(result).toEqual([]);
  });
});
