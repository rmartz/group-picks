import { describe, it, expect } from "vitest";
import {
  groupInviteToFirebase,
  firebaseToGroupInvite,
  type FirebaseGroupInvite,
} from "./invite";

const FIXED_DATE = new Date("2025-01-15T12:00:00.000Z");
const FIXED_TIMESTAMP = FIXED_DATE.getTime();
const EXPIRY_DATE = new Date("2025-02-15T12:00:00.000Z");
const EXPIRY_TIMESTAMP = EXPIRY_DATE.getTime();

function makeFirebaseGroupInvite(
  overrides?: Partial<FirebaseGroupInvite>,
): FirebaseGroupInvite {
  return {
    groupId: "group-123",
    createdAt: FIXED_TIMESTAMP,
    expiresAt: null,
    active: true,
    ...overrides,
  };
}

describe("groupInviteToFirebase", () => {
  it("converts a group invite to Firebase format without expiry", () => {
    const result = groupInviteToFirebase({
      groupId: "group-abc",
      createdAt: FIXED_DATE,
      expiresAt: undefined,
      active: true,
    });

    expect(result.groupId).toBe("group-abc");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.expiresAt).toBeNull();
    expect(result.active).toBe(true);
  });

  it("converts a group invite to Firebase format with expiry", () => {
    const result = groupInviteToFirebase({
      groupId: "group-abc",
      createdAt: FIXED_DATE,
      expiresAt: EXPIRY_DATE,
      active: false,
    });

    expect(result.expiresAt).toBe(EXPIRY_TIMESTAMP);
    expect(result.active).toBe(false);
  });
});

describe("firebaseToGroupInvite", () => {
  it("converts Firebase data to a GroupInvite without expiry", () => {
    const data = makeFirebaseGroupInvite();

    const result = firebaseToGroupInvite("token-xyz", data);

    expect(result.token).toBe("token-xyz");
    expect(result.groupId).toBe("group-123");
    expect(result.createdAt).toEqual(FIXED_DATE);
    expect(result.expiresAt).toBeUndefined();
    expect(result.active).toBe(true);
  });

  it("converts Firebase data to a GroupInvite with expiry", () => {
    const data = makeFirebaseGroupInvite({ expiresAt: EXPIRY_TIMESTAMP });

    const result = firebaseToGroupInvite("token-xyz", data);

    expect(result.expiresAt).toEqual(EXPIRY_DATE);
  });

  it("converts Firebase data to a GroupInvite with active false", () => {
    const data = makeFirebaseGroupInvite({ active: false });

    const result = firebaseToGroupInvite("token-xyz", data);

    expect(result.active).toBe(false);
  });
});
