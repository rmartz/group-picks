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
    inviteToken: "token-abc",
    adminIds: { "user-123": true },
    picksRestricted: false,
    ...overrides,
  };
}

describe("groupToFirebase", () => {
  it("converts a group to Firebase format", () => {
    const result = groupToFirebase({
      name: "My Group",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      inviteToken: "tok-xyz",
      adminIds: ["user-abc"],
      picksRestricted: false,
    });

    expect(result.name).toBe("My Group");
    expect(result.createdAt).toBe(FIXED_TIMESTAMP);
    expect(result.creatorId).toBe("user-abc");
    expect(result.inviteToken).toBe("tok-xyz");
  });

  it("converts adminIds array to Firebase map", () => {
    const result = groupToFirebase({
      name: "My Group",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      inviteToken: "tok-xyz",
      adminIds: ["user-abc", "user-def"],
      picksRestricted: false,
    });

    expect(result.adminIds).toEqual({ "user-abc": true, "user-def": true });
  });

  it("preserves picksRestricted=true", () => {
    const result = groupToFirebase({
      name: "My Group",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      inviteToken: "tok-xyz",
      adminIds: ["user-abc"],
      picksRestricted: true,
    });

    expect(result.picksRestricted).toBe(true);
  });

  it("preserves picksRestricted=false", () => {
    const result = groupToFirebase({
      name: "My Group",
      createdAt: FIXED_DATE,
      creatorId: "user-abc",
      inviteToken: "tok-xyz",
      adminIds: ["user-abc"],
      picksRestricted: false,
    });

    expect(result.picksRestricted).toBe(false);
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
    expect(result.inviteToken).toBe("token-abc");
  });

  it("handles empty member list", () => {
    const data = makeFirebaseGroupPublic();

    const result = firebaseToGroup("group-2", data, []);

    expect(result.memberIds).toEqual([]);
  });

  it("converts adminIds map to array", () => {
    const data = makeFirebaseGroupPublic({
      adminIds: { "user-123": true, "user-789": true },
    });

    const result = firebaseToGroup("group-1", data, ["user-123"]);

    expect(result.adminIds).toEqual(["user-123", "user-789"]);
  });

  it("falls back to [creatorId] when adminIds is absent", () => {
    const data = makeFirebaseGroupPublic({
      creatorId: "user-creator",
      adminIds: undefined,
    });

    const result = firebaseToGroup("group-1", data, ["user-creator"]);

    expect(result.adminIds).toEqual(["user-creator"]);
  });

  it("preserves picksRestricted=true", () => {
    const data = makeFirebaseGroupPublic({ picksRestricted: true });

    const result = firebaseToGroup("group-1", data, ["user-123"]);

    expect(result.picksRestricted).toBe(true);
  });

  it("falls back to picksRestricted=false when absent", () => {
    const data = makeFirebaseGroupPublic({ picksRestricted: undefined });

    const result = firebaseToGroup("group-1", data, ["user-123"]);

    expect(result.picksRestricted).toBe(false);
  });
});
