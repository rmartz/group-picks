import { beforeEach, describe, expect, it, vi } from "vitest";

import { PickNotFoundError, PickWriteClosedError } from "@/server/data/picks";

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockRecordGroupActivity,
  mockGetCategoryById,
  mockClosePick,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockRecordGroupActivity: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockClosePick: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
  recordGroupActivity: mockRecordGroupActivity,
}));

vi.mock("@/server/data/categories", () => ({
  getCategoryById: mockGetCategoryById,
}));

vi.mock("@/server/data/picks", () => ({
  closePick: mockClosePick,
  PICK_CLOSED_API_ERROR: "Pick is closed",
  PickNotFoundError: class PickNotFoundError extends Error {
    readonly code = "pick_not_found";
    constructor() {
      super("Pick not found");
      this.name = "PickNotFoundError";
    }
  },
  PickWriteClosedError: class PickWriteClosedError extends Error {
    readonly code = "pick_closed";
    constructor(message = "Pick is closed and no longer accepts changes.") {
      super(message);
      this.name = "PickWriteClosedError";
    }
  },
}));

const { POST } = await import("./route");

const baseParams = {
  id: "group-1",
  categoryId: "cat-1",
  pickId: "pick-1",
};

function makeRequest() {
  return new Request(
    "http://localhost/api/groups/group-1/categories/cat-1/picks/pick-1/close",
    { method: "POST" },
  );
}

describe("POST /api/.../picks/[pickId]/close", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetVerifiedUid.mockResolvedValue("user-1");
    mockGetGroupById.mockResolvedValue({
      id: "group-1",
      name: "G",
      createdAt: new Date(),
      creatorId: "user-1",
      memberIds: ["user-1"],
    });
    mockGetCategoryById.mockResolvedValue({
      id: "cat-1",
      groupId: "group-1",
      name: "C",
      description: "",
      createdAt: new Date(),
      creatorId: "user-1",
    });
    mockClosePick.mockResolvedValue({
      id: "pick-1",
      title: "Best Pizza",
      categoryId: "cat-1",
      topCount: 1,
      createdAt: new Date(),
      creatorId: "user-1",
    });
    mockRecordGroupActivity.mockResolvedValue(undefined);
  });

  describe("concurrent close attempts return 409 to the second caller", () => {
    it("returns 409 when closePick throws PickWriteClosedError", async () => {
      mockClosePick.mockRejectedValue(new PickWriteClosedError());

      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      expect(response.status).toBe(409);
    });

    it("includes PICK_CLOSED_API_ERROR in the 409 response body", async () => {
      mockClosePick.mockRejectedValue(new PickWriteClosedError());

      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      const body = (await response.json()) as { error: string };
      expect(body.error).toBe("Pick is closed");
    });
  });

  describe("close returns 404 when closePick reports pick not found", () => {
    it("returns 404 when closePick throws PickNotFoundError", async () => {
      mockClosePick.mockRejectedValue(new PickNotFoundError());

      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      expect(response.status).toBe(404);
    });
  });

  describe("successful close", () => {
    it("returns 200 with pickId when closePick resolves", async () => {
      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      expect(response.status).toBe(200);
      const data = (await response.json()) as { pickId: string };
      expect(data.pickId).toBe("pick-1");
    });

    it("calls closePick with categoryId and pickId", async () => {
      await POST(makeRequest(), { params: Promise.resolve(baseParams) });

      expect(mockClosePick).toHaveBeenCalledWith("cat-1", "pick-1");
    });

    it("records group activity after closing a pick", async () => {
      await POST(makeRequest(), { params: Promise.resolve(baseParams) });

      expect(mockRecordGroupActivity).toHaveBeenCalledWith("group-1", {
        summary: 'Closed: "Best Pizza"',
      });
    });

    it("returns 200 when activity recording fails", async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
      mockRecordGroupActivity.mockRejectedValue(new Error("network"));

      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      expect(response.status).toBe(200);
      expect(consoleError).toHaveBeenCalledWith(
        "Failed to record group activity:",
        expect.any(Error),
      );
      consoleError.mockRestore();
    });
  });

  describe("auth and access guards", () => {
    it("returns 401 when caller is not authenticated", async () => {
      mockGetVerifiedUid.mockResolvedValue(null);

      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      expect(response.status).toBe(401);
    });

    it("returns 404 when group does not exist", async () => {
      mockGetGroupById.mockResolvedValue(undefined);

      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      expect(response.status).toBe(404);
    });

    it("returns 403 when caller is not a group member", async () => {
      mockGetGroupById.mockResolvedValue({
        id: "group-1",
        name: "G",
        createdAt: new Date(),
        creatorId: "owner-1",
        memberIds: ["owner-1"],
      });

      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      expect(response.status).toBe(403);
    });

    it("returns 404 when category does not exist", async () => {
      mockGetCategoryById.mockResolvedValue(undefined);

      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      expect(response.status).toBe(404);
    });

    it("returns 404 when category belongs to a different group", async () => {
      mockGetCategoryById.mockResolvedValue({
        id: "cat-1",
        groupId: "other-group",
        name: "C",
      });

      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      expect(response.status).toBe(404);
    });
  });
});
