import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { GroupDetailView } from "./GroupDetailView";
import { GROUP_DETAIL_COPY } from "./copy";

afterEach(cleanup);

function makeGroup() {
  return {
    id: "group-1",
    name: "Friday Night Picks",
    createdAt: new Date("2025-01-15T12:00:00.000Z"),
    creatorId: "user-123",
    memberIds: ["user-123", "user-456"],
  };
}

describe("GroupDetailView", () => {
  it("renders the group name", () => {
    const group = makeGroup();
    render(<GroupDetailView group={group} categories={[]} />);

    expect(screen.getByText(group.name)).toBeDefined();
  });

  it("renders the member count", () => {
    const group = makeGroup();
    render(<GroupDetailView group={group} categories={[]} />);

    expect(
      screen.getByText(GROUP_DETAIL_COPY.membersLabel + ":"),
    ).toBeDefined();
    expect(screen.getByText(String(group.memberIds.length))).toBeDefined();
  });

  it("renders the created at label", () => {
    const group = makeGroup();
    render(<GroupDetailView group={group} categories={[]} />);

    expect(
      screen.getByText(GROUP_DETAIL_COPY.createdAtLabel + ":"),
    ).toBeDefined();
  });
});
