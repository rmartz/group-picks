import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { InviteSectionView } from "./InviteSectionView";
import { GROUP_DETAIL_COPY } from "./copy";

afterEach(cleanup);

const INVITE_URL = "https://example.com/groups/join?token=abc123";

describe("InviteSectionView", () => {
  it("renders the invite label", () => {
    render(
      <InviteSectionView
        inviteUrl={INVITE_URL}
        onRegenerate={() => undefined}
        onCopy={() => undefined}
        regenerating={false}
        copied={false}
        error={undefined}
      />,
    );

    expect(screen.getByText(GROUP_DETAIL_COPY.inviteLabel)).toBeDefined();
  });

  it("renders the invite URL when provided", () => {
    render(
      <InviteSectionView
        inviteUrl={INVITE_URL}
        onRegenerate={() => undefined}
        onCopy={() => undefined}
        regenerating={false}
        copied={false}
        error={undefined}
      />,
    );

    const input = screen.getByLabelText(GROUP_DETAIL_COPY.inviteLabel);
    expect((input as HTMLInputElement).value).toBe(INVITE_URL);
  });

  it("hides the URL input when inviteUrl is undefined", () => {
    render(
      <InviteSectionView
        inviteUrl={undefined}
        onRegenerate={() => undefined}
        onCopy={() => undefined}
        regenerating={false}
        copied={false}
        error={undefined}
      />,
    );

    expect(
      screen.queryByLabelText(GROUP_DETAIL_COPY.inviteLabel),
    ).toBeNull();
  });

  it("renders the generate button when no invite URL exists", () => {
    render(
      <InviteSectionView
        inviteUrl={undefined}
        onRegenerate={() => undefined}
        onCopy={() => undefined}
        regenerating={false}
        copied={false}
        error={undefined}
      />,
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons.some((b) => b.textContent === GROUP_DETAIL_COPY.generateButton)).toBe(true);
  });

  it("renders the regenerate button when an invite URL exists", () => {
    render(
      <InviteSectionView
        inviteUrl={INVITE_URL}
        onRegenerate={() => undefined}
        onCopy={() => undefined}
        regenerating={false}
        copied={false}
        error={undefined}
      />,
    );

    expect(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.regenerateButton }),
    ).toBeDefined();
  });

  it("renders the regenerating text and disables the button when regenerating", () => {
    render(
      <InviteSectionView
        inviteUrl={INVITE_URL}
        onRegenerate={() => undefined}
        onCopy={() => undefined}
        regenerating={true}
        copied={false}
        error={undefined}
      />,
    );

    const button = screen.getByText(GROUP_DETAIL_COPY.regeneratingButton);
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("renders the copy button when an invite URL exists", () => {
    render(
      <InviteSectionView
        inviteUrl={INVITE_URL}
        onRegenerate={() => undefined}
        onCopy={() => undefined}
        regenerating={false}
        copied={false}
        error={undefined}
      />,
    );

    expect(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.copyButton }),
    ).toBeDefined();
  });

  it("renders the copied text after copying", () => {
    render(
      <InviteSectionView
        inviteUrl={INVITE_URL}
        onRegenerate={() => undefined}
        onCopy={() => undefined}
        regenerating={false}
        copied={true}
        error={undefined}
      />,
    );

    expect(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.copiedButton }),
    ).toBeDefined();
  });

  it("renders an error message when provided", () => {
    render(
      <InviteSectionView
        inviteUrl={INVITE_URL}
        onRegenerate={() => undefined}
        onCopy={() => undefined}
        regenerating={false}
        copied={false}
        error={GROUP_DETAIL_COPY.inviteErrors.default}
      />,
    );

    expect(
      screen.getByText(GROUP_DETAIL_COPY.inviteErrors.default),
    ).toBeDefined();
  });

  it("calls onRegenerate when the regenerate button is clicked", () => {
    const onRegenerate = vi.fn();
    render(
      <InviteSectionView
        inviteUrl={INVITE_URL}
        onRegenerate={onRegenerate}
        onCopy={() => undefined}
        regenerating={false}
        copied={false}
        error={undefined}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.regenerateButton }),
    );
    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  it("calls onCopy when the copy button is clicked", () => {
    const onCopy = vi.fn();
    render(
      <InviteSectionView
        inviteUrl={INVITE_URL}
        onRegenerate={() => undefined}
        onCopy={onCopy}
        regenerating={false}
        copied={false}
        error={undefined}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.copyButton }),
    );
    expect(onCopy).toHaveBeenCalledTimes(1);
  });
});
