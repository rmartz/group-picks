import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { Option } from "@/lib/types/option";
import { RankingTier } from "@/lib/types/ranking";

import { TopPicksView } from "./TopPicksView";
import { TOP_PICKS_VIEW_COPY } from "./TopPicksView.copy";

afterEach(cleanup);

function makeOption(id: string, title: string): Option {
  return { id, title, pickId: "pick-1", ownerIds: ["user-1"] };
}

const emptyAttribution = {
  [RankingTier.LoveIt]: [],
  [RankingTier.Yes]: [],
  [RankingTier.Maybe]: [],
  [RankingTier.NotReally]: [],
  noRank: [],
};

describe("TopPicksView", () => {
  describe("locked state (pick is open)", () => {
    it("renders the locked message", () => {
      render(
        <TopPicksView
          isOpen
          topPicks={[]}
          topCount={3}
          topPickAttribution={{}}
        />,
      );
      expect(screen.getByText(TOP_PICKS_VIEW_COPY.lockedMessage)).toBeDefined();
    });

    it("does not render any pick results", () => {
      const options = [makeOption("opt-1", "Option A")];
      render(
        <TopPicksView
          isOpen
          topPicks={options}
          topCount={1}
          topPickAttribution={{}}
        />,
      );
      expect(screen.queryByText("Option A")).toBeNull();
    });
  });

  describe("revealed state (pick is closed)", () => {
    it("renders each top pick by title", () => {
      const options = [
        makeOption("opt-1", "Inception"),
        makeOption("opt-2", "The Matrix"),
      ];
      render(
        <TopPicksView
          isOpen={false}
          topPicks={options}
          topCount={2}
          topPickAttribution={{
            "opt-1": emptyAttribution,
            "opt-2": emptyAttribution,
          }}
        />,
      );
      expect(screen.getByText("Inception")).toBeDefined();
      expect(screen.getByText("The Matrix")).toBeDefined();
    });

    it("renders a rank label for each option", () => {
      const options = [
        makeOption("opt-1", "Inception"),
        makeOption("opt-2", "The Matrix"),
      ];
      render(
        <TopPicksView
          isOpen={false}
          topPicks={options}
          topCount={2}
          topPickAttribution={{
            "opt-1": emptyAttribution,
            "opt-2": emptyAttribution,
          }}
        />,
      );
      expect(screen.getByText("#1")).toBeDefined();
      expect(screen.getByText("#2")).toBeDefined();
    });

    it("renders the empty state when no top picks are available", () => {
      render(
        <TopPicksView
          isOpen={false}
          topPicks={[]}
          topCount={3}
          topPickAttribution={{}}
        />,
      );
      expect(
        screen.getByText(TOP_PICKS_VIEW_COPY.noResultsMessage),
      ).toBeDefined();
    });

    it("renders only the options provided, not more", () => {
      const options = [makeOption("opt-1", "Only Option")];
      render(
        <TopPicksView
          isOpen={false}
          topPicks={options}
          topCount={3}
          topPickAttribution={{ "opt-1": emptyAttribution }}
        />,
      );
      expect(screen.getAllByText(/#\d/).length).toBe(1);
    });

    it("truncates to topCount when more picks are supplied than topCount", () => {
      const options = [
        makeOption("opt-1", "Alpha"),
        makeOption("opt-2", "Beta"),
        makeOption("opt-3", "Gamma"),
        makeOption("opt-4", "Delta"),
      ];
      render(
        <TopPicksView
          isOpen={false}
          topPicks={options}
          topCount={2}
          topPickAttribution={{
            "opt-1": emptyAttribution,
            "opt-2": emptyAttribution,
            "opt-3": emptyAttribution,
            "opt-4": emptyAttribution,
          }}
        />,
      );
      expect(screen.getByText("Alpha")).toBeDefined();
      expect(screen.getByText("Beta")).toBeDefined();
      expect(screen.queryByText("Gamma")).toBeNull();
      expect(screen.queryByText("Delta")).toBeNull();
    });

    it("shows tier attribution rows when a top pick is expanded", () => {
      const options = [makeOption("opt-1", "Inception")];
      render(
        <TopPicksView
          isOpen={false}
          topPicks={options}
          topCount={1}
          topPickAttribution={{
            "opt-1": {
              [RankingTier.LoveIt]: [{ uid: "user-1", firstName: "Alice" }],
              [RankingTier.Yes]: [{ uid: "user-2", firstName: "Bob" }],
              [RankingTier.Maybe]: [],
              [RankingTier.NotReally]: [],
              noRank: [{ uid: "user-3", firstName: "Cara" }],
            },
          }}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /Inception/ }));

      expect(screen.getByText(TOP_PICKS_VIEW_COPY.tiers.loveIt)).toBeDefined();
      expect(screen.getByText("Alice")).toBeDefined();
      expect(screen.getByText("Bob")).toBeDefined();
      expect(screen.getByText("Cara")).toBeDefined();
    });

    it("shows an avatar overflow indicator when a tier has more than six members", () => {
      const options = [makeOption("opt-1", "Inception")];
      render(
        <TopPicksView
          isOpen={false}
          topPicks={options}
          topCount={1}
          topPickAttribution={{
            "opt-1": {
              [RankingTier.LoveIt]: [
                { uid: "u1", firstName: "A" },
                { uid: "u2", firstName: "B" },
                { uid: "u3", firstName: "C" },
                { uid: "u4", firstName: "D" },
                { uid: "u5", firstName: "E" },
                { uid: "u6", firstName: "F" },
                { uid: "u7", firstName: "G" },
              ],
              [RankingTier.Yes]: [],
              [RankingTier.Maybe]: [],
              [RankingTier.NotReally]: [],
              noRank: [],
            },
          }}
        />,
      );

      fireEvent.click(screen.getByRole("button", { name: /Inception/ }));

      expect(screen.getByText("+1")).toBeDefined();
    });
  });
});
