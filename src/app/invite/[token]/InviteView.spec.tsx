import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { InviteView } from "./InviteView";
import { INVITE_COPY } from "./copy";

afterEach(cleanup);

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("InviteView", () => {
  it("renders the heading and group name", () => {
    render(
      <InviteView
        groupId="group-1"
        groupName="Test Group"
        token="tok-abc"
        isMember={false}
      />,
    );

    expect(screen.getByText(INVITE_COPY.heading)).toBeDefined();
    expect(screen.getByText("Test Group", { exact: false })).toBeDefined();
  });

  it("renders the join button when not a member", () => {
    render(
      <InviteView
        groupId="group-1"
        groupName="Test Group"
        token="tok-abc"
        isMember={false}
      />,
    );

    expect(screen.getByText(INVITE_COPY.joinButton)).toBeDefined();
  });

  it("renders already-member message and view group button when already a member", () => {
    render(
      <InviteView
        groupId="group-1"
        groupName="Test Group"
        token="tok-abc"
        isMember={true}
      />,
    );

    expect(screen.getByText(INVITE_COPY.alreadyMember)).toBeDefined();
    expect(screen.getByText(INVITE_COPY.viewGroup)).toBeDefined();
  });

  it("navigates to group page when view group button is clicked", () => {
    render(
      <InviteView
        groupId="group-1"
        groupName="Test Group"
        token="tok-abc"
        isMember={true}
      />,
    );

    fireEvent.click(screen.getByText(INVITE_COPY.viewGroup));

    expect(mockPush).toHaveBeenCalledWith("/groups/group-1");
  });
});
