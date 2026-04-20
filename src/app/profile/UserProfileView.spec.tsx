import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { UserProfileView } from "./UserProfileView";
import { USER_PROFILE_COPY } from "./copy";

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
      screen.getByText(USER_PROFILE_COPY.providers.password),
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
      screen.getByText(USER_PROFILE_COPY.providers["google.com"]),
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
});
