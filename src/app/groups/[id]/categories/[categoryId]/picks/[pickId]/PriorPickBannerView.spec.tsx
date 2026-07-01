import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RankingTier } from "@/lib/types/ranking";

import { PriorPickBannerView } from "./PriorPickBannerView";
import { PRIOR_PICK_BANNER_COPY } from "./PriorPickBannerView.copy";

afterEach(cleanup);

function makeBannerProps(overrides = {}) {
  return {
    categoryName: "Movies",
    pickTitle: "Best of 2024",
    rankedAt: new Date("2024-06-01T00:00:00.000Z"),
    overlappingCount: 3,
    prefillAssignments: { "opt-1": RankingTier.LoveIt },
    onPrefill: vi.fn(),
    onStartFresh: vi.fn(),
    onDismiss: vi.fn(),
    ...overrides,
  };
}

describe("PriorPickBannerView", () => {
  describe("shows heading with category name", () => {
    it("renders the heading with the provided category name", () => {
      render(
        <PriorPickBannerView
          {...makeBannerProps({ categoryName: "Movies" })}
        />,
      );
      expect(
        screen.getByText(PRIOR_PICK_BANNER_COPY.heading("Movies")),
      ).toBeDefined();
    });
  });

  describe("shows prior pick title in sub-text", () => {
    it("renders the prior pick title", () => {
      render(
        <PriorPickBannerView
          {...makeBannerProps({ pickTitle: "Summer 2024" })}
        />,
      );
      expect(screen.getByText(/Summer 2024/)).toBeDefined();
    });
  });

  describe("shows overlapping option count in sub-text", () => {
    it("renders the overlapping count", () => {
      render(
        <PriorPickBannerView {...makeBannerProps({ overlappingCount: 5 })} />,
      );
      expect(screen.getByText(/5/)).toBeDefined();
      expect(
        screen.getByText(new RegExp(PRIOR_PICK_BANNER_COPY.overlapSuffix)),
      ).toBeDefined();
    });
  });

  describe("calls onPrefill when Pre-fill ranking is clicked", () => {
    it("calls onPrefill with the prefill assignments", () => {
      const onPrefill = vi.fn();
      const prefillAssignments = {
        "opt-1": RankingTier.LoveIt,
        "opt-2": RankingTier.Yes,
      };
      render(
        <PriorPickBannerView
          {...makeBannerProps({ onPrefill, prefillAssignments })}
        />,
      );
      fireEvent.click(
        screen.getByRole("button", {
          name: PRIOR_PICK_BANNER_COPY.prefillButton,
        }),
      );
      expect(onPrefill).toHaveBeenCalledWith(prefillAssignments);
    });
  });

  describe("calls onStartFresh when Start fresh is clicked", () => {
    it("calls onStartFresh when the Start fresh button is clicked", () => {
      const onStartFresh = vi.fn();
      render(<PriorPickBannerView {...makeBannerProps({ onStartFresh })} />);
      fireEvent.click(
        screen.getByRole("button", {
          name: PRIOR_PICK_BANNER_COPY.startFreshButton,
        }),
      );
      expect(onStartFresh).toHaveBeenCalledOnce();
    });
  });

  describe("calls onDismiss when dismiss button is clicked", () => {
    it("calls onDismiss when the dismiss button is clicked", () => {
      const onDismiss = vi.fn();
      render(<PriorPickBannerView {...makeBannerProps({ onDismiss })} />);
      fireEvent.click(
        screen.getByRole("button", {
          name: PRIOR_PICK_BANNER_COPY.dismissLabel,
        }),
      );
      expect(onDismiss).toHaveBeenCalledOnce();
    });
  });
});
