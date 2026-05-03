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

function makeMembers() {
  return [
    { uid: "user-123", name: "Alice" },
    { uid: "user-456", name: "Bob" },
  ];
}

describe("GroupDetailView", () => {
  it("renders the group name", () => {
    render(<GroupDetailView group={makeGroup()} members={makeMembers()} />);

    expect(screen.getByText("Friday Night Picks")).toBeDefined();
  });

  it("renders member names", () => {
    render(<GroupDetailView group={makeGroup()} members={makeMembers()} />);

    expect(screen.getByText("Alice")).toBeDefined();
    expect(screen.getByText("Bob")).toBeDefined();
  });

  it("renders the members section title", () => {
    render(<GroupDetailView group={makeGroup()} members={makeMembers()} />);

    expect(screen.getByText(GROUP_DETAIL_COPY.membersTitle)).toBeDefined();
  });

  it("renders the categories placeholder when no categories exist", () => {
    render(<GroupDetailView group={makeGroup()} members={makeMembers()} />);

    expect(screen.getByText(GROUP_DETAIL_COPY.categoriesTitle)).toBeDefined();
    expect(screen.getByText(GROUP_DETAIL_COPY.noCategories)).toBeDefined();
  });

  it("renders the picks placeholder when no picks exist", () => {
    render(<GroupDetailView group={makeGroup()} members={makeMembers()} />);

    expect(screen.getByText(GROUP_DETAIL_COPY.picksTitle)).toBeDefined();
    expect(screen.getByText(GROUP_DETAIL_COPY.noPicks)).toBeDefined();
  });
});
