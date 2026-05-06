import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { InviteLinkSectionView } from "./InviteLinkSectionView";
import { GROUP_DETAIL_COPY } from "./copy";

afterEach(cleanup);

const INVITE_URL = "https://example.com/groups/join?token=abc123";
const FUTURE_DATE = "2099-01-01T00:00:00.000Z";
const PAST_DATE = "2000-01-01T00:00:00.000Z";

function makeDefaultProps(
  overrides?: Partial<Parameters<typeof InviteLinkSectionView>[0]>,
) {
  return {
    inviteUrl: INVITE_URL,
    expiresAt: null,
    expiryInput: "",
    copied: false,
    loading: false,
    error: undefined,
    onCopy: vi.fn(),
    onExpiryChange: vi.fn(),
    onSave: vi.fn(),
    onClearExpiry: vi.fn(),
    ...overrides,
  };
}

describe("InviteLinkSectionView", () => {
  it("renders the invite section title", () => {
    render(<InviteLinkSectionView {...makeDefaultProps()} />);

    expect(screen.getByText(GROUP_DETAIL_COPY.inviteTitle)).toBeDefined();
  });

  it("renders the invite URL in a readonly input", () => {
    render(<InviteLinkSectionView {...makeDefaultProps()} />);

    const input = screen.getByLabelText(GROUP_DETAIL_COPY.inviteTitle);
    expect((input as HTMLInputElement).value).toBe(INVITE_URL);
    expect((input as HTMLInputElement).readOnly).toBe(true);
  });

  it("calls onCopy when the copy button is clicked", () => {
    const onCopy = vi.fn();
    render(<InviteLinkSectionView {...makeDefaultProps({ onCopy })} />);

    fireEvent.click(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.inviteCopyButton }),
    );
    expect(onCopy).toHaveBeenCalledTimes(1);
  });

  it("shows copied label when copied is true", () => {
    render(<InviteLinkSectionView {...makeDefaultProps({ copied: true })} />);

    expect(
      screen.getByRole("button", {
        name: GROUP_DETAIL_COPY.inviteCopiedButton,
      }),
    ).toBeDefined();
  });

  it("shows 'Never' when expiresAt is null", () => {
    render(
      <InviteLinkSectionView {...makeDefaultProps({ expiresAt: null })} />,
    );

    expect(
      screen.getByText(GROUP_DETAIL_COPY.inviteExpiresNever),
    ).toBeDefined();
  });

  it("shows the expiry date when expiresAt is set", () => {
    render(
      <InviteLinkSectionView
        {...makeDefaultProps({ expiresAt: FUTURE_DATE })}
      />,
    );

    expect(
      screen.getByText(new Date(FUTURE_DATE).toLocaleDateString()),
    ).toBeDefined();
  });

  it("shows expired badge when expiry date has passed", () => {
    render(
      <InviteLinkSectionView {...makeDefaultProps({ expiresAt: PAST_DATE })} />,
    );

    expect(
      screen.getByText(GROUP_DETAIL_COPY.inviteExpiredBadge),
    ).toBeDefined();
  });

  it("does not show expired badge for a future expiry date", () => {
    render(
      <InviteLinkSectionView
        {...makeDefaultProps({ expiresAt: FUTURE_DATE })}
      />,
    );

    expect(screen.queryByText(GROUP_DETAIL_COPY.inviteExpiredBadge)).toBeNull();
  });

  it("renders the expiry date input", () => {
    render(<InviteLinkSectionView {...makeDefaultProps()} />);

    expect(
      screen.getByLabelText(GROUP_DETAIL_COPY.inviteExpiryDateLabel),
    ).toBeDefined();
  });

  it("calls onExpiryChange when the date input changes", () => {
    const onExpiryChange = vi.fn();
    render(<InviteLinkSectionView {...makeDefaultProps({ onExpiryChange })} />);

    const input = screen.getByLabelText(
      GROUP_DETAIL_COPY.inviteExpiryDateLabel,
    );
    fireEvent.change(input, { target: { value: "2099-06-15" } });
    expect(onExpiryChange).toHaveBeenCalledWith("2099-06-15");
  });

  it("shows clear button when expiryInput is non-empty", () => {
    render(
      <InviteLinkSectionView
        {...makeDefaultProps({ expiryInput: "2099-06-15" })}
      />,
    );

    expect(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.inviteClearExpiry }),
    ).toBeDefined();
  });

  it("does not show clear button when expiryInput is empty", () => {
    render(
      <InviteLinkSectionView {...makeDefaultProps({ expiryInput: "" })} />,
    );

    expect(
      screen.queryByRole("button", {
        name: GROUP_DETAIL_COPY.inviteClearExpiry,
      }),
    ).toBeNull();
  });

  it("calls onClearExpiry when the clear button is clicked", () => {
    const onClearExpiry = vi.fn();
    render(
      <InviteLinkSectionView
        {...makeDefaultProps({ expiryInput: "2099-06-15", onClearExpiry })}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.inviteClearExpiry }),
    );
    expect(onClearExpiry).toHaveBeenCalledTimes(1);
  });

  it("renders the save button", () => {
    render(<InviteLinkSectionView {...makeDefaultProps()} />);

    expect(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.inviteSaveButton }),
    ).toBeDefined();
  });

  it("shows saving label when loading", () => {
    render(<InviteLinkSectionView {...makeDefaultProps({ loading: true })} />);

    expect(
      screen.getByText(GROUP_DETAIL_COPY.inviteSavingButton),
    ).toBeDefined();
  });

  it("disables the save button when loading", () => {
    render(<InviteLinkSectionView {...makeDefaultProps({ loading: true })} />);

    const button = screen.getByRole("button", {
      name: GROUP_DETAIL_COPY.inviteSavingButton,
    });
    expect((button as HTMLButtonElement).disabled).toBe(true);
  });

  it("calls onSave when the save button is clicked", () => {
    const onSave = vi.fn();
    render(<InviteLinkSectionView {...makeDefaultProps({ onSave })} />);

    fireEvent.click(
      screen.getByRole("button", { name: GROUP_DETAIL_COPY.inviteSaveButton }),
    );
    expect(onSave).toHaveBeenCalledTimes(1);
  });

  it("renders an error message when provided", () => {
    render(
      <InviteLinkSectionView
        {...makeDefaultProps({ error: GROUP_DETAIL_COPY.errors.saveFailed })}
      />,
    );

    expect(screen.getByText(GROUP_DETAIL_COPY.errors.saveFailed)).toBeDefined();
  });
});
