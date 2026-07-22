import { getDatabase } from "firebase-admin/database";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FirebasePickPublic } from "@/lib/firebase/schema/pick";

import { getMostRecentOpenPick } from "./current-pick";

const { mockGetCategoriesByGroupId } = vi.hoisted(() => ({
  mockGetCategoriesByGroupId: vi.fn(),
}));

vi.mock("firebase-admin/database", () => ({
  getDatabase: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminApp: vi.fn(() => "admin-app"),
}));

vi.mock("./categories", () => ({
  getCategoriesByGroupId: mockGetCategoriesByGroupId,
}));

const getDatabaseMock = vi.mocked(getDatabase);

function makeFirebasePickPublic(
  overrides?: Partial<FirebasePickPublic>,
): FirebasePickPublic {
  return {
    title: "Best Picture",
    categoryId: "cat-1",
    createdAt: new Date("2025-01-01T00:00:00.000Z").getTime(),
    creatorId: "user-1",
    ...overrides,
  };
}

interface OpenPickEntry {
  id: string;
  data: FirebasePickPublic;
}

function refWithOpenPicks(entries: OpenPickEntry[]) {
  const snapshot = {
    exists: () => entries.length > 0,
    forEach: (
      callback: (child: { key: string; val: () => FirebasePickPublic }) => void,
    ) => {
      entries.forEach(({ id, data }) => {
        callback({ key: id, val: () => data });
      });
    },
  };

  return {
    orderByChild: vi.fn().mockReturnValue({
      equalTo: vi.fn().mockReturnValue({
        get: vi.fn().mockResolvedValue(snapshot),
      }),
    }),
  };
}

describe("getMostRecentOpenPick", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reads each category's picks filtered to open via orderByChild closedAt equalTo null", async () => {
    mockGetCategoriesByGroupId.mockResolvedValue([{ id: "cat-1" }]);
    const equalTo = vi.fn().mockReturnValue({
      get: vi
        .fn()
        .mockResolvedValue({ exists: () => false, forEach: () => undefined }),
    });
    const orderByChild = vi.fn().mockReturnValue({ equalTo });

    getDatabaseMock.mockReturnValue({
      ref: () => ({ orderByChild }),
    } as never);

    await getMostRecentOpenPick("group-1");

    expect(orderByChild).toHaveBeenCalledWith("closedAt");
    expect(equalTo).toHaveBeenCalledWith(null);
  });

  it("returns the most recently created open pick across categories", async () => {
    mockGetCategoriesByGroupId.mockResolvedValue([
      { id: "cat-1" },
      { id: "cat-2" },
    ]);
    const older = makeFirebasePickPublic({
      title: "Older Open Pick",
      createdAt: new Date("2025-01-10T00:00:00.000Z").getTime(),
    });
    const newer = makeFirebasePickPublic({
      title: "Newer Open Pick",
      dueDate: new Date("2025-03-01T00:00:00.000Z").getTime(),
      createdAt: new Date("2025-02-20T00:00:00.000Z").getTime(),
    });
    const entriesByPath: Record<string, OpenPickEntry[]> = {
      "categories/cat-1/picks": [{ id: "pick-old", data: older }],
      "categories/cat-2/picks": [{ id: "pick-new", data: newer }],
    };

    getDatabaseMock.mockReturnValue({
      ref: (path: string) => refWithOpenPicks(entriesByPath[path] ?? []),
    } as never);

    const pick = await getMostRecentOpenPick("group-1");

    expect(pick?.title).toBe("Newer Open Pick");
    expect(pick?.dueDate).toEqual(new Date("2025-03-01T00:00:00.000Z"));
  });

  it("returns undefined when no category has an open pick", async () => {
    mockGetCategoriesByGroupId.mockResolvedValue([{ id: "cat-1" }]);

    getDatabaseMock.mockReturnValue({
      ref: () => refWithOpenPicks([]),
    } as never);

    const pick = await getMostRecentOpenPick("group-1");

    expect(pick).toBeUndefined();
  });
});
