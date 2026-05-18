import { beforeEach, describe, expect, it, vi } from "vitest";

import { PickNotFoundError, PickWriteClosedError } from "@/server/data/picks";

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockGetCategoryById,
  mockAssertPickIsOpenForWrite,
  mockUpdatePick,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockAssertPickIsOpenForWrite: vi.fn(),
  mockUpdatePick: vi.fn(),
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
  updatePick: mockUpdatePick,
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

const { PATCH } = await import("./route");

const baseParams = {
  id: "group-1",
  categoryId: "cat-1",
  pickId: "pick-1",
};

function makeRequest(body: unknown) {
  return new Request(
    "http://localhost/api/groups/group-1/categories/cat-1/picks/pick-1",
    {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    },
  );
}

describe("PATCH /api/.../picks/[pickId]", () => {
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
      title: "Original Title",
      description: "",
      categoryId: "cat-1",
      topCount: 1,
      createdAt: new Date(),
      creatorId: "user-1",
      closedAt: undefined,
    });
    mockUpdatePick.mockResolvedValue(undefined);
  });

  describe("Calling PATCH on an open pick succeeds and returns 200", () => {
    it("returns 200 and calls updatePick for an open pick", async () => {
      const response = await PATCH(
        makeRequest({ title: "New Title", description: "", topCount: 1 }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(200);
      expect(mockUpdatePick).toHaveBeenCalledWith("cat-1", "pick-1", {
        title: "New Title",
        description: "",
        topCount: 1,
        dueDate: undefined,
      });
    });
  });

  describe("Calling PATCH on a pick whose dueDate is in the past returns an error response and persists closedAt", () => {
    it("returns 409 when assertPickIsOpenForWrite throws PickWriteClosedError", async () => {
      mockAssertPickIsOpenForWrite.mockRejectedValue(
        new PickWriteClosedError(
          "Pick due date has passed. The pick has been closed and no longer accepts changes.",
        ),
      );

      const response = await PATCH(
        makeRequest({ title: "New Title", description: "", topCount: 1 }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(409);
      expect(mockUpdatePick).not.toHaveBeenCalled();
    });

    it("includes a user-readable error message in the 409 response", async () => {
      mockAssertPickIsOpenForWrite.mockRejectedValue(
        new PickWriteClosedError(
          "Pick due date has passed. The pick has been closed and no longer accepts changes.",
        ),
      );

      const response = await PATCH(
        makeRequest({ title: "New Title", description: "", topCount: 1 }),
        { params: Promise.resolve(baseParams) },
      );

      const body = (await response.json()) as { error: string };
      expect(body.error).toBe("Pick is closed");
    });

    it("calls assertPickIsOpenForWrite before updatePick", async () => {
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
      mockUpdatePick.mockImplementation(() => {
        callOrder.push("updatePick");
        return Promise.resolve();
      });

      await PATCH(
        makeRequest({ title: "New Title", description: "", topCount: 1 }),
        { params: Promise.resolve(baseParams) },
      );

      expect(callOrder).toEqual(["assertPickIsOpenForWrite", "updatePick"]);
    });
  });

  describe("Existing pick-not-found path still returns 404", () => {
    it("returns 404 when pick not found is thrown from assertPickIsOpenForWrite", async () => {
      mockAssertPickIsOpenForWrite.mockRejectedValue(new PickNotFoundError());

      const response = await PATCH(
        makeRequest({ title: "New Title", description: "", topCount: 1 }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(404);
    });
  });

  describe("PATCH rejects non-YYYY-MM-DD date strings for dueDate", () => {
    it("returns 400 for a human-readable date string", async () => {
      const response = await PATCH(
        makeRequest({
          title: "T",
          description: "",
          topCount: 1,
          dueDate: "May 14, 2026",
        }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(400);
    });

    it("returns 400 for an ISO datetime string", async () => {
      const response = await PATCH(
        makeRequest({
          title: "T",
          description: "",
          topCount: 1,
          dueDate: "2026-05-14T12:00:00Z",
        }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(400);
    });
  });

  describe("PATCH accepts YYYY-MM-DD dueDate and passes a Date to updatePick", () => {
    it("passes the parsed Date to updatePick for a valid YYYY-MM-DD dueDate", async () => {
      const response = await PATCH(
        makeRequest({
          title: "T",
          description: "",
          topCount: 1,
          dueDate: "2026-01-15",
        }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(200);
      expect(mockUpdatePick).toHaveBeenCalledWith(
        "cat-1",
        "pick-1",
        expect.objectContaining({
          dueDate: new Date("2026-01-15"),
        }),
      );
    });
  });

  describe("PATCH clears dueDate when null or absent", () => {
    it("passes dueDate: undefined to updatePick when dueDate is null", async () => {
      const response = await PATCH(
        makeRequest({
          title: "T",
          description: "",
          topCount: 1,
          dueDate: null,
        }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(200);
      expect(mockUpdatePick).toHaveBeenCalledWith(
        "cat-1",
        "pick-1",
        expect.objectContaining({ dueDate: undefined }),
      );
    });

    it("passes dueDate: undefined to updatePick when dueDate is absent", async () => {
      const response = await PATCH(
        makeRequest({ title: "T", description: "", topCount: 1 }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(200);
      expect(mockUpdatePick).toHaveBeenCalledWith(
        "cat-1",
        "pick-1",
        expect.objectContaining({ dueDate: undefined }),
      );
    });
  });
});
