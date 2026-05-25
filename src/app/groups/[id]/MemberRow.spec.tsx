import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { makeGroup } from "@/lib/fixtures/group";

import { GROUP_DETAIL_COPY } from "./copy";
import { MemberRow } from "./MemberRow";

afterEach(cleanup);

const memberAlice = { uid: "user-1", name: "Alice" };
const memberBob = { uid: "user-2", name: "Bob" };

function renderMemberRow(overrides?: Partial<Parameters<typeof MemberRow>[0]>) {
  const group = makeGroup({
    creatorId: "user-1",
    adminIds: ["user-1"],
    memberIds: ["user-1", "user-2"],
  });
  return render(
    <MemberRow
      member={memberBob}
      group={group}
      isCurrentUser={false}
      isCallerAdmin={true}
      isCallerCreator={true}
      onRemoveClick={vi.fn()}
      {...overrides}
    />,
  );
}

describe("MemberRow — rendering", () => {
  it("renders the member name", () => {
    renderMemberRow();

    expect(screen.getByText(memberBob.name)).toBeDefined();
  });

  it("renders the Creator chip for the group creator", () => {
    const group = makeGroup({ creatorId: memberBob.uid });
    renderMemberRow({ member: memberBob, group });

    expect(screen.getByText(GROUP_DETAIL_COPY.creatorChip)).toBeDefined();
  });

  it("renders the Admin chip for an admin who is not the creator", () => {
    const group = makeGroup({
      creatorId: "user-1",
      adminIds: ["user-1", memberBob.uid],
    });
    renderMemberRow({ member: memberBob, group });

    expect(screen.getByText(GROUP_DETAIL_COPY.adminChip)).toBeDefined();
  });

  it("does not render the Admin chip for a non-admin member", () => {
    const group = makeGroup({ creatorId: "user-1", adminIds: ["user-1"] });
    renderMemberRow({ member: memberBob, group });

    expect(screen.queryByText(GROUP_DETAIL_COPY.adminChip)).toBeNull();
  });
});

describe("MemberRow — menu visibility", () => {
  it("shows the menu trigger when caller is admin and member is not the creator or current user", () => {
    renderMemberRow();

    expect(screen.getByTestId("member-menu-trigger")).toBeDefined();
  });

  it("hides the menu trigger when member is the current user", () => {
    renderMemberRow({ isCurrentUser: true });

    expect(screen.queryByTestId("member-menu-trigger")).toBeNull();
  });

  it("hides the menu trigger when member is the group creator", () => {
    const group = makeGroup({ creatorId: memberBob.uid });
    renderMemberRow({ member: memberBob, group });

    expect(screen.queryByTestId("member-menu-trigger")).toBeNull();
  });

  it("hides the menu trigger when caller is not an admin", () => {
    renderMemberRow({ isCallerAdmin: false });

    expect(screen.queryByTestId("member-menu-trigger")).toBeNull();
  });
});

describe("MemberRow — remove action uses destructive variant", () => {
  it("renders the Remove from group menu item with data-variant=destructive", () => {
    renderMemberRow();

    const trigger = screen.getByTestId("member-menu-trigger");
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);

    const removeItem = screen.getByText(GROUP_DETAIL_COPY.removeAction);
    expect(
      removeItem.closest("[data-variant]")?.getAttribute("data-variant"),
    ).toBe("destructive");
  });
});

describe("MemberRow — admin actions", () => {
  it("calls onMakeAdmin with the member uid when Make admin is clicked", () => {
    const onMakeAdmin = vi.fn();
    renderMemberRow({ onMakeAdmin });

    const trigger = screen.getByTestId("member-menu-trigger");
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText(GROUP_DETAIL_COPY.makeAdminAction));

    expect(onMakeAdmin).toHaveBeenCalledWith(memberBob.uid);
  });

  it("calls onRevokeAdmin with the member uid when Revoke admin is clicked", () => {
    const group = makeGroup({
      creatorId: "user-1",
      adminIds: ["user-1", memberBob.uid],
    });
    const onRevokeAdmin = vi.fn();
    renderMemberRow({ group, onRevokeAdmin });

    const trigger = screen.getByTestId("member-menu-trigger");
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText(GROUP_DETAIL_COPY.revokeAdminAction));

    expect(onRevokeAdmin).toHaveBeenCalledWith(memberBob.uid);
  });

  it("calls onRemoveClick with the member uid when Remove from group is clicked", () => {
    const onRemoveClick = vi.fn();
    renderMemberRow({ onRemoveClick });

    const trigger = screen.getByTestId("member-menu-trigger");
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText(GROUP_DETAIL_COPY.removeAction));

    expect(onRemoveClick).toHaveBeenCalledWith(memberBob.uid);
  });

  it("does not show Make admin / Revoke admin actions when caller is not the creator", () => {
    renderMemberRow({ isCallerCreator: false });

    const trigger = screen.getByTestId("member-menu-trigger");
    fireEvent.pointerDown(trigger);
    fireEvent.pointerUp(trigger);
    fireEvent.click(trigger);

    expect(screen.queryByText(GROUP_DETAIL_COPY.makeAdminAction)).toBeNull();
    expect(screen.queryByText(GROUP_DETAIL_COPY.revokeAdminAction)).toBeNull();
  });
});

describe("MemberRow — member trigger accessibility", () => {
  it("renders the menu trigger with the correct aria-label", () => {
    renderMemberRow();

    const trigger = screen.getByTestId("member-menu-trigger");
    expect(trigger.getAttribute("aria-label")).toBe(
      GROUP_DETAIL_COPY.memberActionsLabel,
    );
  });
});

describe("MemberRow — Alice row (current user / creator)", () => {
  it("renders Alice's name", () => {
    const group = makeGroup({ creatorId: memberAlice.uid });
    render(
      <MemberRow
        member={memberAlice}
        group={group}
        isCurrentUser={true}
        isCallerAdmin={true}
        isCallerCreator={true}
        onRemoveClick={vi.fn()}
      />,
    );

    expect(screen.getByText(memberAlice.name)).toBeDefined();
  });
});
