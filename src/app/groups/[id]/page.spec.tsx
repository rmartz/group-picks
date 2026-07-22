import { cleanup, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const afterCallbacks: (() => unknown)[] = [];
const mockAfter = vi.fn((callback: () => unknown) => {
  afterCallbacks.push(callback);
});
vi.mock("next/server", () => ({
  after: mockAfter,
}));

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

const mockMarkGroupSeen = vi.fn();
vi.mock("@/server/data/groupActivity", () => ({
  markGroupSeen: mockMarkGroupSeen,
}));

const mockGetGroupById = vi.fn();
const mockGetMemberDisplayNames = vi.fn();
vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
  getMemberDisplayNames: mockGetMemberDisplayNames,
}));

const mockGetCategoriesByGroupId = vi.fn();
vi.mock("@/server/data/categories", () => ({
  getCategoriesByGroupId: mockGetCategoriesByGroupId,
}));

const mockGetGroupInviteByToken = vi.fn();
vi.mock("@/server/data/invites", () => ({
  getGroupInviteByToken: mockGetGroupInviteByToken,
}));

const mockGetPicksByCategoryIds = vi.fn();
vi.mock("@/server/data/picks", () => ({
  getPicksByCategoryIds: mockGetPicksByCategoryIds,
}));

const mockGetActiveSnapPickActivationsByCategories = vi.fn();
vi.mock("@/server/data/snap-picks", () => ({
  getActiveSnapPickActivationsByCategories:
    mockGetActiveSnapPickActivationsByCategories,
}));

vi.mock("./GroupDetailClient", () => ({
  GroupDetailClient: () => <div data-testid="group-detail-client" />,
}));

const UID = "uid-current";
const GROUP_ID = "group-1";

async function renderPage() {
  const { default: GroupDetailPage } = await import("./page");
  return render(
    await GroupDetailPage({
      params: Promise.resolve({ id: GROUP_ID }),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  afterCallbacks.length = 0;

  mockGetVerifiedUid.mockResolvedValue(UID);
  mockGetGroupById.mockResolvedValue({
    id: GROUP_ID,
    name: "Test Group",
    createdAt: new Date(),
    creatorId: UID,
    memberIds: [UID, "uid-member2"],
    adminIds: [UID],
    picksRestricted: false,
    inviteToken: "token",
  });
  mockGetGroupInviteByToken.mockResolvedValue(undefined);
  mockGetCategoriesByGroupId.mockResolvedValue([]);
  mockGetMemberDisplayNames.mockResolvedValue([]);
  mockGetPicksByCategoryIds.mockResolvedValue({});
  mockGetActiveSnapPickActivationsByCategories.mockResolvedValue({});
  mockMarkGroupSeen.mockResolvedValue(undefined);
});

afterEach(cleanup);

describe("GroupDetailPage — deferring the markGroupSeen write", () => {
  it("schedules the write with after() rather than invoking it during render", async () => {
    await renderPage();

    expect(mockAfter).toHaveBeenCalledTimes(1);
    expect(mockMarkGroupSeen).not.toHaveBeenCalled();
  });
});

describe("GroupDetailPage — running the deferred markGroupSeen write", () => {
  it("marks the group seen for the current user when the deferred callback runs", async () => {
    await renderPage();

    expect(afterCallbacks).toHaveLength(1);
    await afterCallbacks[0]?.();

    expect(mockMarkGroupSeen).toHaveBeenCalledTimes(1);
    expect(mockMarkGroupSeen).toHaveBeenCalledWith(UID, GROUP_ID);
  });
});
