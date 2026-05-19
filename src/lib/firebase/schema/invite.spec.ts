import { describe, expect, it } from "vitest";

import { InviteMode } from "@/lib/types/invite";

import {
  type FirebaseGroupInvite,
  firebaseToGroupInvite,
  groupInviteToFirebase,
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
    mode: InviteMode.Group,
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
      mode: InviteMode.Personal,
    });

    expect(result.groupId).toBe("group-abc");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.expiresAt).toBeNull();
    expect(result.active).toBe(true);
    expect(result.mode).toBe(InviteMode.Personal);
  });

  it("converts a group invite to Firebase format with expiry", () => {
    const result = groupInviteToFirebase({
      groupId: "group-abc",
      createdAt: FIXED_DATE,
      expiresAt: EXPIRY_DATE,
      active: false,
      mode: InviteMode.Group,
    });

    expect(result.expiresAt).toBe(EXPIRY_TIMESTAMP);
    expect(result.active).toBe(false);
    expect(result.mode).toBe(InviteMode.Group);
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
    expect(result.mode).toBe(InviteMode.Group);
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

  it("converts Firebase data for a Personal invite", () => {
    const data = makeFirebaseGroupInvite({ mode: InviteMode.Personal });

    const result = firebaseToGroupInvite("token-xyz", data);

    expect(result.mode).toBe(InviteMode.Personal);
  });

  it("defaults mode to Group when mode field is missing (legacy data)", () => {
    const data = makeFirebaseGroupInvite();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { mode: _mode, ...dataWithoutMode } = data;

    const result = firebaseToGroupInvite("token-xyz", dataWithoutMode);

    expect(result.mode).toBe(InviteMode.Group);
  });
});
