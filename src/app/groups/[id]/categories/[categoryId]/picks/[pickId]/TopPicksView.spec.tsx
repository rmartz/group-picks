import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { Option } from "@/lib/types/option";

import { TopPicksView } from "./TopPicksView";
import { TOP_PICKS_VIEW_COPY } from "./TopPicksView.copy";

afterEach(cleanup);

function makeOption(id: string, title: string): Option {
  return { id, title, pickId: "pick-1", ownerIds: ["user-1"] };
}

describe("TopPicksView", () => {
  describe("locked state (pick is open)", () => {
    it("renders the locked message", () => {
      render(<TopPicksView isOpen topPicks={[]} topCount={3} />);
      expect(screen.getByText(TOP_PICKS_VIEW_COPY.lockedMessage)).toBeDefined();
    });

    it("does not render any pick results", () => {
      const options = [makeOption("opt-1", "Option A")];
      render(<TopPicksView isOpen topPicks={options} topCount={1} />);
      expect(screen.queryByText("Option A")).toBeNull();
    });
  });

  describe("revealed state (pick is closed)", () => {
    it("renders each top pick by title", () => {
      const options = [
        makeOption("opt-1", "Inception"),
        makeOption("opt-2", "The Matrix"),
      ];
      render(<TopPicksView isOpen={false} topPicks={options} topCount={2} />);
      expect(screen.getByText("Inception")).toBeDefined();
      expect(screen.getByText("The Matrix")).toBeDefined();
    });

    it("renders a rank label for each option", () => {
      const options = [
        makeOption("opt-1", "Inception"),
        makeOption("opt-2", "The Matrix"),
      ];
      render(<TopPicksView isOpen={false} topPicks={options} topCount={2} />);
      expect(screen.getByText("#1")).toBeDefined();
      expect(screen.getByText("#2")).toBeDefined();
    });

    it("renders the empty state when no top picks are available", () => {
      render(<TopPicksView isOpen={false} topPicks={[]} topCount={3} />);
      expect(
        screen.getByText(TOP_PICKS_VIEW_COPY.noResultsMessage),
      ).toBeDefined();
    });

    it("renders only the options provided, not more", () => {
      const options = [makeOption("opt-1", "Only Option")];
      render(<TopPicksView isOpen={false} topPicks={options} topCount={3} />);
      expect(screen.getAllByText(/#\d/).length).toBe(1);
    });
  });
});
