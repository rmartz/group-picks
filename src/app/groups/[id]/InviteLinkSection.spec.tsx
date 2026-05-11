import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  act,
} from "@testing-library/react";
import { InviteLinkSection } from "./InviteLinkSection";
import { GROUP_DETAIL_COPY } from "./copy";

afterEach(cleanup);

describe("InviteLinkSection", () => {
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("location", { origin: "https://example.com" });
    vi.stubGlobal("navigator", { clipboard: { writeText } });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders the invite URL using window.location.origin after mount", () => {
    render(<InviteLinkSection inviteToken="abc123" />);

    expect(
      screen.getByText("https://example.com/invite/abc123", { exact: false }),
    ).toBeDefined();
  });

  it("renders the copy button", () => {
    render(<InviteLinkSection inviteToken="abc123" />);

    expect(screen.getByText(GROUP_DETAIL_COPY.copyLink)).toBeDefined();
  });

  it("shows copied state after clicking copy button", async () => {
    render(<InviteLinkSection inviteToken="abc123" />);

    fireEvent.click(screen.getByText(GROUP_DETAIL_COPY.copyLink));
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText(GROUP_DETAIL_COPY.copied)).toBeDefined();
    expect(writeText).toHaveBeenCalledWith("https://example.com/invite/abc123");
  });
});
