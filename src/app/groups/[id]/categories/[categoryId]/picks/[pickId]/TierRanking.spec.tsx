import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import type { Option } from "@/lib/types/option";

import { TierRanking } from "./TierRanking";
import { RankingTier, TIER_RANKING_COPY } from "./TierRanking.copy";

afterEach(cleanup);

const makeOption = (overrides: Partial<Option> = {}): Option => ({
  id: "opt-1",
  title: "Option A",
  pickId: "pick-1",
  ownerIds: ["user-1"],
  ...overrides,
});

describe("TierRanking", () => {
  describe("cycling tier on click", () => {
    it("starts with options in Unranked", () => {
      const option = makeOption({ id: "opt-1", title: "Inception" });
      render(<TierRanking options={[option]} />);
      expect(screen.getByText("Inception")).toBeDefined();
    });

    it("advances an option to LoveIt on first click", () => {
      const option = makeOption({ id: "opt-1", title: "Inception" });
      render(<TierRanking options={[option]} />);
      fireEvent.click(screen.getByText("Inception"));
      const loveItHeader = screen.getByText(
        TIER_RANKING_COPY.tiers[RankingTier.LoveIt],
      );
      expect(loveItHeader).toBeDefined();
      expect(screen.getAllByText("Inception")).toBeDefined();
    });

    it("cycles through all tiers and back to Unranked", () => {
      const option = makeOption({ id: "opt-1", title: "Inception" });
      render(<TierRanking options={[option]} />);

      const getChip = () => screen.getByText("Inception");
      const getTierSectionFor = (chip: HTMLElement) => {
        // Walk up to the tier bucket div (the one with the h3 sibling)
        let el: HTMLElement | null = chip;
        while (el && el.previousElementSibling?.tagName !== "H3") {
          el = el.parentElement;
        }
        return el?.previousElementSibling?.textContent ?? null;
      };

      // Unranked → LoveIt
      fireEvent.click(getChip());
      expect(getTierSectionFor(getChip())).toBe(
        TIER_RANKING_COPY.tiers[RankingTier.LoveIt],
      );

      // LoveIt → Yes
      fireEvent.click(getChip());
      expect(getTierSectionFor(getChip())).toBe(
        TIER_RANKING_COPY.tiers[RankingTier.Yes],
      );

      // Yes → Maybe
      fireEvent.click(getChip());
      expect(getTierSectionFor(getChip())).toBe(
        TIER_RANKING_COPY.tiers[RankingTier.Maybe],
      );

      // Maybe → NotReally
      fireEvent.click(getChip());
      expect(getTierSectionFor(getChip())).toBe(
        TIER_RANKING_COPY.tiers[RankingTier.NotReally],
      );

      // NotReally → Unranked
      fireEvent.click(getChip());
      expect(getTierSectionFor(getChip())).toBe(
        TIER_RANKING_COPY.tiers[RankingTier.Unranked],
      );
    });
  });
});
