import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockAuthorizeSnapPickMember,
  mockGetSnapPickOptions,
  mockRemoveSnapPickOption,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockAuthorizeSnapPickMember: vi.fn(),
  mockGetSnapPickOptions: vi.fn(),
  mockRemoveSnapPickOption: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/utils/snap-pick-auth", () => ({
  authorizeSnapPickMember: mockAuthorizeSnapPickMember,
}));

vi.mock("@/server/data/snap-picks", () => ({
  getSnapPickOptions: mockGetSnapPickOptions,
  removeSnapPickOption: mockRemoveSnapPickOption,
}));

const { DELETE } = await import("./route");

const params = Promise.resolve({
  id: "group-1",
  categoryId: "cat-1",
  snapPickId: "snap-1",
  optionId: "option-1",
});

function makeOption(overrides?: Record<string, unknown>) {
  return {
    id: "option-1",
    title: "Pizza",
    addedBy: "user-1",
    addedAt: new Date("2025-01-10T00:00:00Z"),
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetVerifiedUid.mockResolvedValue("user-1");
  mockAuthorizeSnapPickMember.mockResolvedValue(undefined);
  mockGetSnapPickOptions.mockResolvedValue([makeOption()]);
  mockRemoveSnapPickOption.mockResolvedValue({
    removedAt: new Date("2025-01-20T00:00:00Z"),
  });
});

describe("DELETE /api/.../snap-picks/[snapPickId]/options/[optionId]", () => {
  it("soft-deletes the option when the caller owns it", async () => {
    const response = await DELETE(new Request("http://localhost"), { params });

    expect(response.status).toBe(200);
    expect(mockRemoveSnapPickOption).toHaveBeenCalledWith("snap-1", "option-1");
  });

  it("returns 403 when the caller does not own the option", async () => {
    mockGetSnapPickOptions.mockResolvedValue([
      makeOption({ addedBy: "someone-else" }),
    ]);

    const response = await DELETE(new Request("http://localhost"), { params });

    expect(response.status).toBe(403);
    expect(mockRemoveSnapPickOption).not.toHaveBeenCalled();
  });

  it("returns 404 when the option does not exist", async () => {
    mockGetSnapPickOptions.mockResolvedValue([]);

    const response = await DELETE(new Request("http://localhost"), { params });

    expect(response.status).toBe(404);
  });

  it("returns 404 when the option is already removed", async () => {
    mockGetSnapPickOptions.mockResolvedValue([
      makeOption({ removedAt: new Date("2025-01-15T00:00:00Z") }),
    ]);

    const response = await DELETE(new Request("http://localhost"), { params });

    expect(response.status).toBe(404);
    expect(mockRemoveSnapPickOption).not.toHaveBeenCalled();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(undefined);

    const response = await DELETE(new Request("http://localhost"), { params });

    expect(response.status).toBe(401);
  });

  it("returns 403 when member authorization fails", async () => {
    mockAuthorizeSnapPickMember.mockResolvedValue(
      NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    );

    const response = await DELETE(new Request("http://localhost"), { params });

    expect(response.status).toBe(403);
    expect(mockRemoveSnapPickOption).not.toHaveBeenCalled();
  });
});
