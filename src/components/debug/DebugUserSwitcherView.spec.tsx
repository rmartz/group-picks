import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { DebugProfile } from "@/lib/debug/profiles";

import { DEBUG_SWITCHER_COPY } from "./DebugUserSwitcher.copy";
import { DebugUserSwitcherView } from "./DebugUserSwitcherView";

afterEach(cleanup);

const profiles: DebugProfile[] = [
  {
    id: "debug-alice",
    label: "Alice — group owner",
    description: "Owns a seeded group.",
    email: "alice@debug.local",
    displayName: "Alice (debug)",
  },
  {
    id: "debug-bob",
    label: "Bob — group member",
    description: "A member.",
    email: "bob@debug.local",
    displayName: "Bob (debug)",
  },
];

describe("lists the seeded profiles and invokes onSelect", () => {
  it("calls onSelect with the chosen profile id when clicked", () => {
    const onSelect = vi.fn();
    render(
      <DebugUserSwitcherView
        error={undefined}
        loadingId={undefined}
        onSelect={onSelect}
        profiles={profiles}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /Alice/ }));

    expect(onSelect).toHaveBeenCalledWith("debug-alice");
  });
});

describe("reflects loading and error states", () => {
  it("shows the signing-in label and disables buttons while a profile loads", () => {
    render(
      <DebugUserSwitcherView
        error={undefined}
        loadingId="debug-alice"
        onSelect={vi.fn()}
        profiles={profiles}
      />,
    );

    expect(screen.getByText(DEBUG_SWITCHER_COPY.signingIn)).toBeDefined();
    expect(
      screen.getByRole("button", { name: /Bob/ }).hasAttribute("disabled"),
    ).toBe(true);
  });

  it("renders an error alert when provided", () => {
    render(
      <DebugUserSwitcherView
        error={DEBUG_SWITCHER_COPY.error}
        loadingId={undefined}
        onSelect={vi.fn()}
        profiles={profiles}
      />,
    );

    expect(screen.getByRole("alert").textContent).toContain(
      DEBUG_SWITCHER_COPY.error,
    );
  });
});
