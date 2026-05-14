import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { GROUP_DETAIL_COPY } from "./copy";
import { InviteSectionView } from "./InviteSectionView";

afterEach(cleanup);

const INVITE_URL = "https://example.com/groups/join?token=abc123";
const EXPIRES_AT = new Date("2026-05-13T12:00:00.000Z");

function makeProps(
  overrides?: Partial<Parameters<typeof InviteSectionView>[0]>,
) {
  return {
    inviteUrl: INVITE_URL,
    expiresAt: EXPIRES_AT,
    onRegenerate: () => undefined,
    onCopy: () => undefined,
    regenerating: false,
    copied: false,
    error: undefined,
    ...overrides,
  };
}

describe("InviteSectionView", () => {
  it("renders the invite label", () => {
    render(<InviteSectionView {...makeProps()} />);

    expect(screen.getByText(GROUP_DETAIL_COPY.inviteLabel)).toBeDefined();
  });

  it("renders the invite URL when provided", () => {
    render(<InviteSectionView {...makeProps()} />);

    const input = screen.getByLabelText(GROUP_DETAIL_COPY.inviteLabel);
    expect((input as HTMLInputElement).value).toBe(INVITE_URL);
  });

  it("hides the URL input when inviteUrl is undefined", () => {
    render(<InviteSectionView {...makeProps({ inviteUrl: undefined })} />);

    expect(screen.queryByLabelText(GROUP_DETAIL_COPY.inviteLabel)).toBeNull();
  });

  it("renders the generate button when no invite URL exists", () => {
    render(<InviteSectionView {...makeProps({ inviteUrl: undefined })} />);

    const buttons = screen.getAllByRole("button");
    expect(
      buttons.some((b) => b.textContent === GROUP_DETAIL_COPY.generateButton),
    ).toBe(true);
  });

  it("renders the regenerate button when an invite URL exists", () => {
    render(<InviteSectionView {...makeProps()} />);

    expect(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.regenerateButton }),
    ).toBeDefined();
  });

  it("renders the regenerating text and disables the button when regenerating", () => {
    render(<InviteSectionView {...makeProps({ regenerating: true })} />);

    const button = screen.getByText(GROUP_DETAIL_COPY.regeneratingButton);
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("renders the copy button when an invite URL exists", () => {
    render(<InviteSectionView {...makeProps()} />);

    expect(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.copyButton }),
    ).toBeDefined();
  });

  it("renders the copied text after copying", () => {
    render(<InviteSectionView {...makeProps({ copied: true })} />);

    expect(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.copiedButton }),
    ).toBeDefined();
  });

  it("renders an error message when provided", () => {
    render(
      <InviteSectionView
        {...makeProps({ error: GROUP_DETAIL_COPY.inviteErrors.default })}
      />,
    );

    expect(
      screen.getByText(GROUP_DETAIL_COPY.inviteErrors.default),
    ).toBeDefined();
  });

  it("calls onRegenerate when the regenerate button is clicked", () => {
    const onRegenerate = vi.fn();
    render(<InviteSectionView {...makeProps({ onRegenerate })} />);

    fireEvent.click(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.regenerateButton }),
    );
    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  it("calls onCopy when the copy button is clicked", () => {
    const onCopy = vi.fn();
    render(<InviteSectionView {...makeProps({ onCopy })} />);

    fireEvent.click(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.copyButton }),
    );
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("shows the expiry date label when expiresAt is provided", () => {
    render(<InviteSectionView {...makeProps({ expiresAt: EXPIRES_AT })} />);

    expect(screen.getByText(GROUP_DETAIL_COPY.expiresAtLabel)).toBeDefined();
  });

  it("shows the formatted expiry date when expiresAt is provided", () => {
    render(<InviteSectionView {...makeProps({ expiresAt: EXPIRES_AT })} />);

    expect(screen.getByText(EXPIRES_AT.toLocaleDateString())).toBeDefined();
  });

  it("does not show the expiry label when expiresAt is undefined", () => {
    render(<InviteSectionView {...makeProps({ expiresAt: undefined })} />);

    expect(screen.queryByText(GROUP_DETAIL_COPY.expiresAtLabel)).toBeNull();
  });
});
