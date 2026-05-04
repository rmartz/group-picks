import { describe, it, expect, afterEach, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  act,
} from "@testing-library/react";
import { InviteView } from "./InviteView";
import { INVITE_COPY } from "./copy";

afterEach(cleanup);

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("InviteView", () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

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

  it("calls join API and redirects to group page on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));

    render(
      <InviteView
        groupId="group-1"
        groupName="Test Group"
        token="tok-abc"
        isMember={false}
      />,
    );

    fireEvent.click(screen.getByText(INVITE_COPY.joinButton));
    await act(async () => {
      await Promise.resolve();
    });

    expect(fetch).toHaveBeenCalledWith("/api/invite/tok-abc/join", {
      method: "POST",
    });
    expect(mockPush).toHaveBeenCalledWith("/groups/group-1");

    vi.unstubAllGlobals();
  });

  it("shows error message when join API fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));

    render(
      <InviteView
        groupId="group-1"
        groupName="Test Group"
        token="tok-abc"
        isMember={false}
      />,
    );

    fireEvent.click(screen.getByText(INVITE_COPY.joinButton));
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText(INVITE_COPY.error)).toBeDefined();
    expect(mockPush).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
