import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { USER_PROFILE_COPY } from "./copy";
import { UserProfileView } from "./UserProfileView";

afterEach(cleanup);

const noop = vi.fn();

describe("UserProfileView", () => {
  it("renders the page title", () => {
    render(
      <UserProfileView
        initialDisplayName="Alice"
        providerIds={[]}
        onSave={noop}
      />,
    );
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
      USER_PROFILE_COPY.title,
    );
  });

  it("renders the display name field with the initial value", () => {
    render(
      <UserProfileView
        initialDisplayName="Alice"
        providerIds={[]}
        onSave={noop}
      />,
    );
    const input = screen.getByLabelText(USER_PROFILE_COPY.displayNameLabel);
    expect((input as HTMLInputElement).value).toBe("Alice");
  });

  it("renders the save button", () => {
    render(
      <UserProfileView initialDisplayName="" providerIds={[]} onSave={noop} />,
    );
    expect(
      screen.getByRole("button", { name: USER_PROFILE_COPY.saveButton }),
    ).toBeDefined();
  });

  it("renders the linked accounts section heading", () => {
    render(
      <UserProfileView initialDisplayName="" providerIds={[]} onSave={noop} />,
    );
    expect(screen.getByRole("heading", { level: 2 }).textContent).toBe(
      USER_PROFILE_COPY.linkedAccountsTitle,
    );
  });

  it("renders a known provider label for password", () => {
    render(
      <UserProfileView
        initialDisplayName=""
        providerIds={["password"]}
        onSave={noop}
      />,
    );
    expect(
      screen.getByText(USER_PROFILE_COPY.providers["password"]!),
    ).toBeDefined();
  });

  it("renders a known provider label for google.com", () => {
    render(
      <UserProfileView
        initialDisplayName=""
        providerIds={["google.com"]}
        onSave={noop}
      />,
    );
    expect(
      screen.getByText(USER_PROFILE_COPY.providers["google.com"]!),
    ).toBeDefined();
  });

  it("renders an unknown provider id as-is", () => {
    render(
      <UserProfileView
        initialDisplayName=""
        providerIds={["github.com"]}
        onSave={noop}
      />,
    );
    expect(screen.getByText("github.com")).toBeDefined();
  });

  it("shows success message after a successful save", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    render(
      <UserProfileView
        initialDisplayName="Alice"
        providerIds={[]}
        onSave={onSave}
      />,
    );
    fireEvent.submit(
      screen
        .getByRole("button", { name: USER_PROFILE_COPY.saveButton })
        .closest("form")!,
    );
    await waitFor(() => {
      expect(screen.getByText(USER_PROFILE_COPY.successMessage)).toBeDefined();
    });
  });

  it("shows error message after a failed save", async () => {
    const onSave = vi.fn().mockRejectedValue(new Error("update failed"));
    render(
      <UserProfileView
        initialDisplayName="Alice"
        providerIds={[]}
        onSave={onSave}
      />,
    );
    fireEvent.submit(
      screen
        .getByRole("button", { name: USER_PROFILE_COPY.saveButton })
        .closest("form")!,
    );
    await waitFor(() => {
      expect(screen.getByText(USER_PROFILE_COPY.errors.default)).toBeDefined();
    });
  });

  it("disables the save button while saving", async () => {
    let resolve: () => void;
    const onSave = vi.fn().mockReturnValue(
      new Promise<void>((res) => {
        resolve = res;
      }),
    );
    render(
      <UserProfileView
        initialDisplayName="Alice"
        providerIds={[]}
        onSave={onSave}
      />,
    );
    const button = screen.getByRole("button", {
      name: USER_PROFILE_COPY.saveButton,
    });
    fireEvent.submit(button.closest("form")!);
    await waitFor(() => {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });
    resolve!();
  });
});
