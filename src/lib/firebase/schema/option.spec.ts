import { describe, it, expect } from "vitest";
import {
  optionToFirebase,
  firebaseToOption,
  type FirebaseOptionPublic,
} from "./option";

const FIXED_DATE = new Date("2025-04-01T12:00:00.000Z");
const FIXED_TIMESTAMP = FIXED_DATE.getTime();

function makeFirebaseOptionPublic(
  overrides?: Partial<FirebaseOptionPublic>,
): FirebaseOptionPublic {
  return {
    name: "Pizza",
    creatorId: "user-1",
    owners: { "user-1": true },
    createdAt: FIXED_TIMESTAMP,
    ...overrides,
  };
}

describe("optionToFirebase", () => {
  it("converts an option to Firebase format", () => {
    const result = optionToFirebase({
      name: "Pizza",
      creatorId: "user-1",
      owners: ["user-1", "user-2"],
      createdAt: FIXED_DATE,
    });

    expect(result.name).toBe("Pizza");
    expect(result.creatorId).toBe("user-1");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.owners).toEqual({ "user-1": true, "user-2": true });
  });

  it("converts empty owners array to empty record", () => {
    const result = optionToFirebase({
      name: "Sushi",
      creatorId: "user-2",
      owners: [],
      createdAt: FIXED_DATE,
    });

    expect(result.owners).toEqual({});
  });
});

describe("firebaseToOption", () => {
  it("converts Firebase data to a PickOption", () => {
    const data = makeFirebaseOptionPublic();
    const result = firebaseToOption("opt-1", "cat-1", "pick-1", data);

    expect(result.id).toBe("opt-1");
    expect(result.categoryId).toBe("cat-1");
    expect(result.pickId).toBe("pick-1");
    expect(result.name).toBe("Pizza");
    expect(result.creatorId).toBe("user-1");
    expect(result.owners).toEqual(["user-1"]);
    expect(result.createdAt).toEqual(FIXED_DATE);
  });

  it("converts multiple owners from record to array", () => {
    const data = makeFirebaseOptionPublic({
      owners: { "user-1": true, "user-2": true, "user-3": true },
    });
    const result = firebaseToOption("opt-2", "cat-1", "pick-1", data);

    expect(result.owners).toHaveLength(3);
    expect(result.owners).toContain("user-1");
    expect(result.owners).toContain("user-2");
    expect(result.owners).toContain("user-3");
  });

  it("handles missing owners field gracefully", () => {
    const data = makeFirebaseOptionPublic({ owners: {} });
    const result = firebaseToOption("opt-3", "cat-1", "pick-1", data);

    expect(result.owners).toEqual([]);
  });

  it("round-trips through Firebase format", () => {
    const original = {
      name: "Tacos",
      creatorId: "user-5",
      owners: ["user-5"],
      createdAt: FIXED_DATE,
    };

    const firebase = optionToFirebase(original);
    const result = firebaseToOption("opt-4", "cat-2", "pick-2", firebase);

    expect(result.name).toBe(original.name);
    expect(result.creatorId).toBe(original.creatorId);
    expect(result.owners).toEqual(original.owners);
    expect(result.createdAt).toEqual(original.createdAt);
  });
});
