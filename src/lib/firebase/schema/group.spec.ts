import { describe, it, expect } from "vitest";
import {
  groupToFirebase,
  firebaseToGroup,
  type FirebaseGroupPublic,
} from "./group";

const FIXED_DATE = new Date("2025-01-15T12:00:00.000Z");
const FIXED_TIMESTAMP = FIXED_DATE.getTime();

function makeFirebaseGroupPublic(
  overrides?: Partial<FirebaseGroupPublic>,
): FirebaseGroupPublic {
  return {
    name: "Test Group",
    createdAt: FIXED_TIMESTAMP,
    creatorId: "user-123",
    ...overrides,
  };
}

describe("groupToFirebase", () => {
  it("converts a group to Firebase format", () => {
    const result = groupToFirebase({
      name: "My Group",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
    });

    expect(result.name).toBe("My Group");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.creatorId).toBe("user-abc");
  });
});

describe("firebaseToGroup", () => {
  it("converts Firebase data to a Group", () => {
    const data = makeFirebaseGroupPublic();
    const memberIds = ["user-123", "user-456"];

    const result = firebaseToGroup("group-1", data, memberIds);

    expect(result.id).toBe("group-1");
    expect(result.name).toBe("Test Group");
    expect(result.createdAt).toEqual(FIXED_DATE);
    expect(result.creatorId).toBe("user-123");
    expect(result.memberIds).toEqual(["user-123", "user-456"]);
  });

  it("handles empty member list", () => {
    const data = makeFirebaseGroupPublic();

    const result = firebaseToGroup("group-2", data, []);

    expect(result.memberIds).toEqual([]);
  });
});
