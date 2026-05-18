import { beforeEach, describe, expect, it, vi } from "vitest";

import { PickWriteClosedError } from "@/server/data/picks";

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockGetCategoryById,
  mockAssertPickIsOpenForWrite,
  mockClosePick,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockAssertPickIsOpenForWrite: vi.fn(),
  mockClosePick: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/data/groups", () => ({
  getGroupById: mockGetGroupById,
}));

vi.mock("@/server/data/categories", () => ({
  getCategoryById: mockGetCategoryById,
}));

vi.mock("@/server/data/picks", () => ({
  assertPickIsOpenForWrite: mockAssertPickIsOpenForWrite,
  closePick: mockClosePick,
  PICK_CLOSED_API_ERROR: "Pick is closed",
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
    mockAssertPickIsOpenForWrite.mockResolvedValue({
      id: "pick-1",
      title: "Open Pick",
      description: "",
      categoryId: "cat-1",
      topCount: 1,
      createdAt: new Date(),
      creatorId: "user-1",
      closedAt: undefined,
    });
    mockClosePick.mockResolvedValue(undefined);
  });

  describe("Close succeeds for an open pick", () => {
    it("returns 200 and calls closePick when pick is open", async () => {
      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      expect(response.status).toBe(200);
      expect(mockClosePick).toHaveBeenCalledWith("cat-1", "pick-1");
    });

    it("calls assertPickIsOpenForWrite before closePick", async () => {
      const callOrder: string[] = [];
      mockAssertPickIsOpenForWrite.mockImplementation(() => {
        callOrder.push("assertPickIsOpenForWrite");
        return Promise.resolve({
          id: "pick-1",
          title: "P",
          description: "",
          categoryId: "cat-1",
          topCount: 1,
          createdAt: new Date(),
          creatorId: "user-1",
          closedAt: undefined,
        });
      });
      mockClosePick.mockImplementation(() => {
        callOrder.push("closePick");
        return Promise.resolve();
      });

      await POST(makeRequest(), { params: Promise.resolve(baseParams) });

      expect(callOrder).toEqual(["assertPickIsOpenForWrite", "closePick"]);
    });
  });

  describe("Close returns 409 when pick is already closed", () => {
    it("returns 409 when assertPickIsOpenForWrite throws PickWriteClosedError", async () => {
      mockAssertPickIsOpenForWrite.mockRejectedValue(
        new PickWriteClosedError(
          "Pick is closed and no longer accepts changes.",
        ),
      );

      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      expect(response.status).toBe(409);
      expect(mockClosePick).not.toHaveBeenCalled();
    });

    it("includes PICK_CLOSED_API_ERROR in the 409 response body", async () => {
      mockAssertPickIsOpenForWrite.mockRejectedValue(
        new PickWriteClosedError(
          "Pick is closed and no longer accepts changes.",
        ),
      );

      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      const body = (await response.json()) as { error: string };
      expect(body.error).toBe("Pick is closed");
    });
  });

  describe("Close returns 404 when pick is not found", () => {
    it("returns 404 when assertPickIsOpenForWrite throws Pick not found", async () => {
      mockAssertPickIsOpenForWrite.mockRejectedValue(
        new Error("Pick not found"),
      );

      const response = await POST(makeRequest(), {
        params: Promise.resolve(baseParams),
      });

      expect(response.status).toBe(404);
    });
  });
});
