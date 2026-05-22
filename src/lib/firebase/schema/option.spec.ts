import { describe, expect, it } from "vitest";

import {
  type FirebaseOption,
  firebaseToOption,
  optionToFirebase,
} from "./option";

function makeFirebaseOption(
  overrides?: Partial<FirebaseOption>,
): FirebaseOption {
  return {
    title: "The Shawshank Redemption",
    ownerIds: { "user-1": true, "user-2": true },
    createdAt: new Date("2025-01-01T00:00:00.000Z").getTime(),
    ...overrides,
  };
}

describe("optionToFirebase", () => {
  it("converts title and ownerIds array to Firebase format", () => {
    const result = optionToFirebase({
      title: "Inception",
      ownerIds: ["user-a", "user-b"],
      createdAt: "2025-01-01T00:00:00.000Z",
    });

    expect(result.title).toBe("Inception");
    expect(result.ownerIds).toEqual({ "user-a": true, "user-b": true });
    expect(result.createdAt).toBe(
      new Date("2025-01-01T00:00:00.000Z").getTime(),
    );
  });

  it("produces an empty ownerIds map when no owners", () => {
    const result = optionToFirebase({ title: "Inception", ownerIds: [] });

    expect(result.ownerIds).toEqual({});
  });
});

describe("firebaseToOption", () => {
  it("converts Firebase data to an Option", () => {
    const data = makeFirebaseOption();
    const result = firebaseToOption("opt-1", "pick-42", data);

    expect(result.id).toBe("opt-1");
    expect(result.title).toBe("The Shawshank Redemption");
    expect(result.pickId).toBe("pick-42");
    expect(result.ownerIds).toEqual(["user-1", "user-2"]);
    expect(result.createdAt).toBe("2025-01-01T00:00:00.000Z");
  });

  it("returns an empty ownerIds array when ownerIds map is absent", () => {
    const data = makeFirebaseOption({
      ownerIds: undefined as unknown as Record<string, true>,
    });
    const result = firebaseToOption("opt-1", "pick-42", data);

    expect(result.ownerIds).toEqual([]);
  });
});
