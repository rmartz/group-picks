import { describe, expect, it } from "vitest";

import type { Group } from "@/lib/types/group";

import {
  canModifyOption,
  canModifyResource,
  isGroupAdmin,
} from "./permissions";

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: "group-1",
    name: "Test Group",
    emoji: "👥",
    createdAt: new Date("2025-01-01"),
    creatorId: "creator-1",
    memberIds: ["creator-1", "admin-1", "member-1"],
    adminIds: ["admin-1"],
    picksRestricted: false,
    inviteToken: "token-1",
    ...overrides,
  };
}

describe("isGroupAdmin", () => {
  it("returns true when uid is in adminIds", () => {
    const group = makeGroup({ adminIds: ["admin-1"] });
    expect(isGroupAdmin("admin-1", group)).toBe(true);
  });

  it("returns false when uid is not in adminIds", () => {
    const group = makeGroup({ adminIds: ["admin-1"] });
    expect(isGroupAdmin("member-1", group)).toBe(false);
  });

  it("returns false when adminIds is empty", () => {
    const group = makeGroup({ adminIds: [] });
    expect(isGroupAdmin("member-1", group)).toBe(false);
  });
});

describe("canModifyResource", () => {
  it("allows the resource creator", () => {
    const group = makeGroup({ adminIds: ["admin-1"] });
    expect(canModifyResource("creator-1", "creator-1", group)).toBe(true);
  });

  it("allows a group admin who is not the creator", () => {
    const group = makeGroup({ adminIds: ["admin-1"] });
    expect(canModifyResource("admin-1", "creator-1", group)).toBe(true);
  });

  it("denies an unrelated group member", () => {
    const group = makeGroup({ adminIds: ["admin-1"] });
    expect(canModifyResource("member-1", "creator-1", group)).toBe(false);
  });
});

describe("canModifyOption", () => {
  it("allows a uid in ownerIds", () => {
    const group = makeGroup({ adminIds: ["admin-1"] });
    expect(canModifyOption("member-1", ["member-1", "other-1"], group)).toBe(
      true,
    );
  });

  it("allows a group admin not in ownerIds", () => {
    const group = makeGroup({ adminIds: ["admin-1"] });
    expect(canModifyOption("admin-1", ["member-1"], group)).toBe(true);
  });

  it("denies an unrelated member not in ownerIds", () => {
    const group = makeGroup({ adminIds: ["admin-1"] });
    expect(canModifyOption("member-2", ["member-1"], group)).toBe(false);
  });
});
