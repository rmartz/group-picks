import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { PickNotFoundError, PickWriteClosedError } from "@/server/data/picks";

const {
  mockGetVerifiedUid,
  mockGetGroupById,
  mockGetCategoryById,
  mockUpdatePickIfOpen,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockGetGroupById: vi.fn(),
  mockGetCategoryById: vi.fn(),
  mockUpdatePickIfOpen: vi.fn(),
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
  updatePickIfOpen: mockUpdatePickIfOpen,
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
    mockUpdatePickIfOpen.mockResolvedValue(undefined);
  });

  describe("Calling PATCH on an open pick succeeds and returns 200", () => {
    it("returns 200 and calls updatePickIfOpen for an open pick", async () => {
      const response = await PATCH(
        makeRequest({ title: "New Title", description: "", topCount: 1 }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(200);
      expect(mockUpdatePickIfOpen).toHaveBeenCalledWith("cat-1", "pick-1", {
        title: "New Title",
        description: "",
        topCount: 1,
        dueDate: undefined,
      });
    });
  });

  describe("Calling PATCH on a pick whose dueDate is in the past returns an error response and persists closedAt", () => {
    it("returns 409 when updatePickIfOpen throws PickWriteClosedError", async () => {
      mockUpdatePickIfOpen.mockRejectedValue(
        new PickWriteClosedError(
          "Pick due date has passed. The pick has been closed and no longer accepts changes.",
        ),
      );

      const response = await PATCH(
        makeRequest({ title: "New Title", description: "", topCount: 1 }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(409);
    });

    it("includes a user-readable error message in the 409 response", async () => {
      mockUpdatePickIfOpen.mockRejectedValue(
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

    it("calls updatePickIfOpen with categoryId and pickId", async () => {
      await PATCH(
        makeRequest({ title: "New Title", description: "", topCount: 1 }),
        { params: Promise.resolve(baseParams) },
      );

      expect(mockUpdatePickIfOpen).toHaveBeenCalledWith(
        "cat-1",
        "pick-1",
        expect.any(Object),
      );
    });
  });

  describe("Existing pick-not-found path still returns 404", () => {
    it("returns 404 when pick not found is thrown from updatePickIfOpen", async () => {
      mockUpdatePickIfOpen.mockRejectedValue(new PickNotFoundError());

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

  describe("PATCH accepts YYYY-MM-DD dueDate and passes a Date to updatePickIfOpen", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-03-15T12:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("passes the parsed Date to updatePickIfOpen for a valid YYYY-MM-DD dueDate", async () => {
      const response = await PATCH(
        makeRequest({
          title: "T",
          description: "",
          topCount: 1,
          dueDate: "2026-06-01",
        }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(200);
      expect(mockUpdatePickIfOpen).toHaveBeenCalledWith(
        "cat-1",
        "pick-1",
        expect.objectContaining({
          dueDate: new Date("2026-06-01"),
        }),
      );
    });
  });

  describe("PATCH clears dueDate when null or absent", () => {
    it("passes dueDate: undefined to updatePickIfOpen when dueDate is null", async () => {
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
      expect(mockUpdatePickIfOpen).toHaveBeenCalledWith(
        "cat-1",
        "pick-1",
        expect.objectContaining({ dueDate: undefined }),
      );
    });

    it("passes dueDate: undefined to updatePickIfOpen when dueDate is absent", async () => {
      const response = await PATCH(
        makeRequest({ title: "T", description: "", topCount: 1 }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(200);
      expect(mockUpdatePickIfOpen).toHaveBeenCalledWith(
        "cat-1",
        "pick-1",
        expect.objectContaining({ dueDate: undefined }),
      );
    });
  });

  describe("PATCH rejects a dueDate that is already in the past", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2026-03-15T12:00:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("returns 400 when dueDate is in the past", async () => {
      const response = await PATCH(
        makeRequest({
          title: "T",
          description: "",
          topCount: 1,
          dueDate: "2026-03-01",
        }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(400);
    });

    it("includes a user-readable error message for a past dueDate", async () => {
      const response = await PATCH(
        makeRequest({
          title: "T",
          description: "",
          topCount: 1,
          dueDate: "2026-03-01",
        }),
        { params: Promise.resolve(baseParams) },
      );

      const body = (await response.json()) as { error: string };
      expect(body.error).toBe("dueDate cannot be in the past");
    });

    it("does not call assertPickIsOpenForWrite when dueDate is in the past", async () => {
      await PATCH(
        makeRequest({
          title: "T",
          description: "",
          topCount: 1,
          dueDate: "2026-03-01",
        }),
        { params: Promise.resolve(baseParams) },
      );

      expect(mockUpdatePickIfOpen).not.toHaveBeenCalled();
    });

    it("returns 200 for a dueDate in the future", async () => {
      const response = await PATCH(
        makeRequest({
          title: "T",
          description: "",
          topCount: 1,
          dueDate: "2026-06-01",
        }),
        { params: Promise.resolve(baseParams) },
      );

      expect(response.status).toBe(200);
    });
  });
});
