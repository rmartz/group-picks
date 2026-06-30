import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Option } from "@/lib/types/option";
import type { PriorPickBannerData } from "@/lib/types/ranking";
import { RankingTier } from "@/lib/types/ranking";

import { PRIOR_PICK_BANNER_COPY } from "./PriorPickBannerView.copy";
import { TierRanking } from "./TierRanking";
import { TIER_RANKING_COPY } from "./TierRanking.copy";

const { mockSaveRankings } = vi.hoisted(() => ({
  mockSaveRankings: vi.fn(),
}));

vi.mock("@/services/rankings", () => ({
  saveRankings: mockSaveRankings,
}));

afterEach(cleanup);

const makeOption = (overrides: Partial<Option> = {}): Option => ({
  id: "opt-1",
  title: "Option A",
  pickId: "pick-1",
  ownerIds: ["user-1"],
  ...overrides,
});

const baseProps = {
  groupId: "group-1",
  categoryId: "cat-1",
  pickId: "pick-1",
};

describe("TierRanking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSaveRankings.mockResolvedValue(undefined);
  });

  describe("initial tier assignments", () => {
    it("renders an option in its initial tier when initialTierAssignments is provided", () => {
      const option = makeOption({ id: "opt-1", title: "Inception" });
      render(
        <TierRanking
          {...baseProps}
          options={[option]}
          initialTierAssignments={{ "opt-1": RankingTier.LoveIt }}
        />,
      );

      const loveItSection = screen
        .getByText(TIER_RANKING_COPY.tiers[RankingTier.LoveIt])
        .closest("div");
      expect(loveItSection?.textContent).toContain("Inception");
    });

    it("places options in Unranked when no initialTierAssignments are provided", () => {
      const option = makeOption({ id: "opt-1", title: "Inception" });
      render(
        <TierRanking
          {...baseProps}
          options={[option]}
          initialTierAssignments={{}}
        />,
      );

      const unrankedSection = screen
        .getByText(TIER_RANKING_COPY.tiers[RankingTier.Unranked])
        .closest("div");
      expect(unrankedSection?.textContent).toContain("Inception");
    });
  });

  describe("save on tier change", () => {
    it("calls saveRankings when an option tier is changed", () => {
      const option = makeOption({ id: "opt-1", title: "Inception" });
      render(
        <TierRanking
          {...baseProps}
          options={[option]}
          initialTierAssignments={{}}
        />,
      );

      fireEvent.click(screen.getByText("Inception"));

      expect(mockSaveRankings).toHaveBeenCalledWith(
        "group-1",
        "cat-1",
        "pick-1",
        { "opt-1": RankingTier.LoveIt },
      );
    });

    it("passes updated assignments including unchanged options to saveRankings", () => {
      const opt1 = makeOption({ id: "opt-1", title: "Inception" });
      const opt2 = makeOption({ id: "opt-2", title: "Matrix" });
      render(
        <TierRanking
          {...baseProps}
          options={[opt1, opt2]}
          initialTierAssignments={{ "opt-2": RankingTier.Yes }}
        />,
      );

      fireEvent.click(screen.getByText("Inception"));

      expect(mockSaveRankings).toHaveBeenCalledWith(
        "group-1",
        "cat-1",
        "pick-1",
        { "opt-1": RankingTier.LoveIt, "opt-2": RankingTier.Yes },
      );
    });
  });

  describe("cycling tier on click", () => {
    it("starts with options in Unranked", () => {
      const option = makeOption({ id: "opt-1", title: "Inception" });
      render(
        <TierRanking
          {...baseProps}
          options={[option]}
          initialTierAssignments={{}}
        />,
      );
      expect(screen.getByText("Inception")).toBeDefined();
    });

    it("advances an option to LoveIt on first click", () => {
      const option = makeOption({ id: "opt-1", title: "Inception" });
      render(
        <TierRanking
          {...baseProps}
          options={[option]}
          initialTierAssignments={{}}
        />,
      );
      fireEvent.click(screen.getByText("Inception"));
      const loveItHeader = screen.getByText(
        TIER_RANKING_COPY.tiers[RankingTier.LoveIt],
      );
      expect(loveItHeader).toBeDefined();
      expect(screen.getAllByText("Inception")).toBeDefined();
    });

    it("cycles through all tiers and back to Unranked", () => {
      const option = makeOption({ id: "opt-1", title: "Inception" });
      render(
        <TierRanking
          {...baseProps}
          options={[option]}
          initialTierAssignments={{}}
        />,
      );

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

      // Maybe → NotForMe
      fireEvent.click(getChip());
      expect(getTierSectionFor(getChip())).toBe(
        TIER_RANKING_COPY.tiers[RankingTier.NotForMe],
      );

      // NotForMe → Unranked
      fireEvent.click(getChip());
      expect(getTierSectionFor(getChip())).toBe(
        TIER_RANKING_COPY.tiers[RankingTier.Unranked],
      );
    });
  });

  describe("prior pick banner", () => {
    function makeBannerData(
      overrides: Partial<PriorPickBannerData> = {},
    ): PriorPickBannerData {
      return {
        pickTitle: "Summer 2024",
        rankedAt: new Date("2024-06-01T00:00:00.000Z"),
        overlappingCount: 2,
        prefillAssignments: { "opt-1": RankingTier.LoveIt },
        ...overrides,
      };
    }

    describe("shows banner when priorPickBannerData provided and no current assignments", () => {
      it("renders the pre-fill banner when data is provided and no existing assignments", () => {
        const option = makeOption({ id: "opt-1", title: "Inception" });
        render(
          <TierRanking
            {...baseProps}
            options={[option]}
            initialTierAssignments={{}}
            priorPickBannerData={makeBannerData()}
          />,
        );
        expect(
          screen.getByRole("button", {
            name: PRIOR_PICK_BANNER_COPY.prefillButton,
          }),
        ).toBeDefined();
      });
    });

    describe("does not show banner when initialTierAssignments is non-empty", () => {
      it("hides the banner when the user already has tier assignments", () => {
        const option = makeOption({ id: "opt-1", title: "Inception" });
        render(
          <TierRanking
            {...baseProps}
            options={[option]}
            initialTierAssignments={{ "opt-1": RankingTier.LoveIt }}
            priorPickBannerData={makeBannerData()}
          />,
        );
        expect(
          screen.queryByRole("button", {
            name: PRIOR_PICK_BANNER_COPY.prefillButton,
          }),
        ).toBeNull();
      });
    });

    describe("does not show banner when priorPickBannerData is undefined", () => {
      it("renders no banner when priorPickBannerData is not provided", () => {
        const option = makeOption({ id: "opt-1", title: "Inception" });
        render(
          <TierRanking
            {...baseProps}
            options={[option]}
            initialTierAssignments={{}}
          />,
        );
        expect(
          screen.queryByRole("button", {
            name: PRIOR_PICK_BANNER_COPY.prefillButton,
          }),
        ).toBeNull();
      });
    });

    describe("hides banner when Start fresh is clicked", () => {
      it("removes the banner when the user clicks Start fresh", () => {
        const option = makeOption({ id: "opt-1", title: "Inception" });
        render(
          <TierRanking
            {...baseProps}
            options={[option]}
            initialTierAssignments={{}}
            priorPickBannerData={makeBannerData()}
          />,
        );
        fireEvent.click(
          screen.getByRole("button", {
            name: PRIOR_PICK_BANNER_COPY.startFreshButton,
          }),
        );
        expect(
          screen.queryByRole("button", {
            name: PRIOR_PICK_BANNER_COPY.prefillButton,
          }),
        ).toBeNull();
      });
    });

    describe("applies pre-fill assignments when Pre-fill ranking is clicked", () => {
      it("moves the matched option into the pre-filled tier after pre-fill", () => {
        const option = makeOption({ id: "opt-1", title: "Inception" });
        render(
          <TierRanking
            {...baseProps}
            options={[option]}
            initialTierAssignments={{}}
            priorPickBannerData={makeBannerData({
              prefillAssignments: { "opt-1": RankingTier.LoveIt },
            })}
          />,
        );
        fireEvent.click(
          screen.getByRole("button", {
            name: PRIOR_PICK_BANNER_COPY.prefillButton,
          }),
        );
        const loveItSection = screen
          .getByText(TIER_RANKING_COPY.tiers[RankingTier.LoveIt])
          .closest("div");
        expect(loveItSection?.textContent).toContain("Inception");
      });

      it("hides the banner after pre-fill is applied", () => {
        const option = makeOption({ id: "opt-1", title: "Inception" });
        render(
          <TierRanking
            {...baseProps}
            options={[option]}
            initialTierAssignments={{}}
            priorPickBannerData={makeBannerData()}
          />,
        );
        fireEvent.click(
          screen.getByRole("button", {
            name: PRIOR_PICK_BANNER_COPY.prefillButton,
          }),
        );
        expect(
          screen.queryByRole("button", {
            name: PRIOR_PICK_BANNER_COPY.prefillButton,
          }),
        ).toBeNull();
      });

      it("shows from-prior-pick label on pre-filled options after applying pre-fill", () => {
        const option = makeOption({ id: "opt-1", title: "Inception" });
        render(
          <TierRanking
            {...baseProps}
            options={[option]}
            initialTierAssignments={{}}
            priorPickBannerData={makeBannerData({
              prefillAssignments: { "opt-1": RankingTier.LoveIt },
            })}
          />,
        );
        fireEvent.click(
          screen.getByRole("button", {
            name: PRIOR_PICK_BANNER_COPY.prefillButton,
          }),
        );
        expect(
          screen.getByText(TIER_RANKING_COPY.fromPriorPickLabel),
        ).toBeDefined();
      });
    });
  });
});
