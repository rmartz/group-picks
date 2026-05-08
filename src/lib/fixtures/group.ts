import type { Group } from "@/lib/types/group";

export function makeGroup(overrides?: Partial<Group>): Group {
  return {
    id: "group-1",
    name: "Test Group",
    createdAt: new Date("2024-01-01"),
    creatorId: "user-1",
    memberIds: ["user-1"],
    ...overrides,
  };
}
