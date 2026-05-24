import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { OptionTierAttribution } from "@/lib/ranking-score";
import type { Option } from "@/lib/types/option";
import { RankingTier } from "@/lib/types/ranking";

const mockRedirect = vi.fn();
const mockNotFound = vi.fn();
vi.mock("next/navigation", () => ({
  redirect: mockRedirect,
  notFound: mockNotFound,
}));

const mockGetVerifiedUid = vi.fn();
vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

const mockGetGroupById = vi.fn();
const mockGetMemberDisplayNames = vi.fn();
vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
  getMemberDisplayNames: mockGetMemberDisplayNames,
}));

const mockGetCategoryById = vi.fn();
vi.mock("@/server/data/categories", () => ({
  getCategoryById: mockGetCategoryById,
}));

const mockGetPickById = vi.fn();
const mockGetPicksByCategory = vi.fn();
vi.mock("@/server/data/picks", () => ({
  getPickById: mockGetPickById,
  getPicksByCategory: mockGetPicksByCategory,
}));

const mockGetOptionsByPick = vi.fn();
const mockGetOptionsByCategory = vi.fn();
vi.mock("@/server/data/options", () => ({
  getOptionsByPick: mockGetOptionsByPick,
  getOptionsByCategory: mockGetOptionsByCategory,
}));

const mockGetAllRankingsForPick = vi.fn();
const mockGetRankingByUser = vi.fn();
vi.mock("@/server/data/rankings", () => ({
  getAllRankingsForPick: mockGetAllRankingsForPick,
  getRankingByUser: mockGetRankingByUser,
}));

interface CapturedPickDetailProps {
  topPicks: Option[];
  topPickAttribution: Record<string, OptionTierAttribution>;
}

const capturedProps: CapturedPickDetailProps[] = [];
vi.mock("./PickDetailView", () => ({
  PickDetailView: (props: CapturedPickDetailProps) => {
    capturedProps.push(props);
    return <div data-testid="pick-detail-view" />;
  },
}));

async function renderPage() {
  const { default: PickDetailPage } = await import("./page");
  return render(
    await PickDetailPage({
      params: Promise.resolve({
        id: "group-1",
        categoryId: "cat-1",
        pickId: "pick-1",
      }),
    }),
  );
}

function setupClosedPickDefaults() {
  mockGetVerifiedUid.mockResolvedValue("uid-current");
  mockGetGroupById.mockResolvedValue({
    id: "group-1",
    name: "Test Group",
    createdAt: new Date(),
    creatorId: "uid-current",
    memberIds: ["uid-current", "uid-member2"],
    adminIds: ["uid-current"],
    picksRestricted: false,
    inviteToken: "token",
  });
  mockGetCategoryById.mockResolvedValue({
    id: "cat-1",
    groupId: "group-1",
    name: "Test Category",
    createdAt: new Date(),
  });
  mockGetPickById.mockResolvedValue({
    id: "pick-1",
    title: "Test Pick",
    topCount: 3,
    categoryId: "cat-1",
    closedAt: new Date(),
    createdAt: new Date(),
    creatorId: "uid-current",
  });
  mockGetPicksByCategory.mockResolvedValue([]);
  mockGetOptionsByCategory.mockResolvedValue([]);
  mockGetRankingByUser.mockResolvedValue({});
  mockGetMemberDisplayNames.mockResolvedValue([
    { uid: "uid-current", name: "Alice" },
    { uid: "uid-member2", name: "Bob" },
  ]);
}

describe("PickDetailPage — former-member exclusion", () => {
  it("excludes former members' rankings when computing top picks for a closed pick", async () => {
    capturedProps.length = 0;

    setupClosedPickDefaults();

    mockGetOptionsByPick.mockResolvedValue([
      {
        id: "opt-a",
        title: "Option A",
        pickId: "pick-1",
        ownerIds: ["uid-current"],
      },
      {
        id: "opt-b",
        title: "Option B",
        pickId: "pick-1",
        ownerIds: ["uid-current"],
      },
    ]);

    // uid-current (current member) ranks opt-a Yes (score 3)
    // uid-former (former member, not in memberIds) ranks opt-b LoveIt (score 4)
    // Without filtering: opt-b wins (4 > 3). With filtering: opt-a wins (3 > 0).
    mockGetAllRankingsForPick.mockResolvedValue({
      "uid-current": { "opt-a": RankingTier.Yes },
      "uid-former": { "opt-b": RankingTier.LoveIt },
    });

    await renderPage();

    expect(capturedProps).toHaveLength(1);
    expect(capturedProps[0]?.topPicks[0]?.id).toBe("opt-a");
  });

  it("excludes former members from tier attribution for a closed pick", async () => {
    capturedProps.length = 0;

    setupClosedPickDefaults();

    mockGetOptionsByPick.mockResolvedValue([
      {
        id: "opt-a",
        title: "Option A",
        pickId: "pick-1",
        ownerIds: ["uid-current"],
      },
    ]);

    // uid-former is not in group.memberIds, so should not appear in attribution
    mockGetAllRankingsForPick.mockResolvedValue({
      "uid-current": { "opt-a": RankingTier.LoveIt },
      "uid-former": { "opt-a": RankingTier.Yes },
    });

    await renderPage();

    expect(capturedProps).toHaveLength(1);
    const loveItMembers =
      capturedProps[0]?.topPickAttribution["opt-a"]?.[RankingTier.LoveIt] ?? [];
    expect(loveItMembers).toHaveLength(1);
    expect(loveItMembers[0]?.uid).toBe("uid-current");
  });
});
