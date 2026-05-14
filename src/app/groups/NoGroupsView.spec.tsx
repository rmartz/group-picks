import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { NoGroupsView } from "./NoGroupsView";
import { GROUP_LIST_COPY } from "./copy";

afterEach(cleanup);

describe("NoGroupsView", () => {
  describe("headline and body", () => {
    it("renders the empty-state headline", () => {
      render(<NoGroupsView />);
      expect(screen.getByRole("heading").textContent).toBe(
        GROUP_LIST_COPY.emptyHeadline,
      );
    });

    it("renders the body copy", () => {
      render(<NoGroupsView />);
      expect(screen.getByText(GROUP_LIST_COPY.emptyBody)).toBeDefined();
    });
  });

  describe("create group CTA", () => {
    it("renders a link to /groups/new", () => {
      render(<NoGroupsView />);
      const link = screen.getByRole("link", {
        name: GROUP_LIST_COPY.emptyCreateButton,
      });
      expect(link.getAttribute("href")).toContain("/groups/new");
    });
  });

  describe("join group CTA", () => {
    it("renders the join button", () => {
      render(<NoGroupsView />);
      expect(
        screen.getByRole("button", { name: GROUP_LIST_COPY.emptyJoinButton }),
      ).toBeDefined();
    });
  });
});
