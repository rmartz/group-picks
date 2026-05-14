import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Option } from "@/lib/types/option";

import { RankingTier, TIER_RANKING_COPY } from "./TierRanking.copy";
import { TierRankingView } from "./TierRankingView";

afterEach(cleanup);

const makeOption = (overrides: Partial<Option> = {}): Option => ({
  id: "opt-1",
  title: "Option A",
  pickId: "pick-1",
  ownerIds: ["user-1"],
  ...overrides,
});

describe("TierRankingView", () => {
  describe("renders tier bucket headers", () => {
    it("renders the Love it tier header", () => {
      render(
        <TierRankingView
          options={[]}
          tierAssignments={{}}
          onOptionClick={() => undefined}
        />,
      );
      expect(
        screen.getByText(TIER_RANKING_COPY.tiers[RankingTier.LoveIt]),
      ).toBeDefined();
    });

    it("renders the Yes tier header", () => {
      render(
        <TierRankingView
          options={[]}
          tierAssignments={{}}
          onOptionClick={() => undefined}
        />,
      );
      expect(
        screen.getByText(TIER_RANKING_COPY.tiers[RankingTier.Yes]),
      ).toBeDefined();
    });

    it("renders the Maybe tier header", () => {
      render(
        <TierRankingView
          options={[]}
          tierAssignments={{}}
          onOptionClick={() => undefined}
        />,
      );
      expect(
        screen.getByText(TIER_RANKING_COPY.tiers[RankingTier.Maybe]),
      ).toBeDefined();
    });

    it("renders the Not really tier header", () => {
      render(
        <TierRankingView
          options={[]}
          tierAssignments={{}}
          onOptionClick={() => undefined}
        />,
      );
      expect(
        screen.getByText(TIER_RANKING_COPY.tiers[RankingTier.NotReally]),
      ).toBeDefined();
    });

    it("renders the Unranked tier header", () => {
      render(
        <TierRankingView
          options={[]}
          tierAssignments={{}}
          onOptionClick={() => undefined}
        />,
      );
      expect(
        screen.getByText(TIER_RANKING_COPY.tiers[RankingTier.Unranked]),
      ).toBeDefined();
    });
  });

  describe("places options in their assigned tier", () => {
    it("shows an option in the assigned tier section", () => {
      const option = makeOption({ id: "opt-1", title: "Inception" });
      render(
        <TierRankingView
          options={[option]}
          tierAssignments={{ "opt-1": RankingTier.LoveIt }}
          onOptionClick={() => undefined}
        />,
      );
      expect(screen.getByText("Inception")).toBeDefined();
    });

    it("shows unassigned options in the Unranked section", () => {
      const option = makeOption({ id: "opt-1", title: "Inception" });
      render(
        <TierRankingView
          options={[option]}
          tierAssignments={{}}
          onOptionClick={() => undefined}
        />,
      );
      expect(screen.getByText("Inception")).toBeDefined();
    });
  });

  describe("calls onOptionClick", () => {
    it("calls onOptionClick with the option id when an option chip is clicked", () => {
      const onOptionClick = vi.fn();
      const option = makeOption({ id: "opt-99", title: "Matrix" });
      render(
        <TierRankingView
          options={[option]}
          tierAssignments={{}}
          onOptionClick={onOptionClick}
        />,
      );
      fireEvent.click(screen.getByText("Matrix"));
      expect(onOptionClick).toHaveBeenCalledWith("opt-99");
    });
  });
});
