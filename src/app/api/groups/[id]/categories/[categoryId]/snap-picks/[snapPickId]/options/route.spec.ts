import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockAuthorizeSnapPickMember,
  mockGetSnapPickOptions,
  mockAddSnapPickOption,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockAuthorizeSnapPickMember: vi.fn(),
  mockGetSnapPickOptions: vi.fn(),
  mockAddSnapPickOption: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/utils/snap-pick-auth", () => ({
  authorizeSnapPickMember: mockAuthorizeSnapPickMember,
}));

vi.mock("@/server/data/snap-picks", () => ({
  getSnapPickOptions: mockGetSnapPickOptions,
  addSnapPickOption: mockAddSnapPickOption,
}));

const { GET, POST } = await import("./route");

const params = Promise.resolve({
  id: "group-1",
  categoryId: "cat-1",
  snapPickId: "snap-1",
});

function makeRequest(body: unknown) {
  return new Request(
    "http://localhost/api/groups/group-1/categories/cat-1/snap-picks/snap-1/options",
    {
      method: "POST",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetVerifiedUid.mockResolvedValue("user-1");
  mockAuthorizeSnapPickMember.mockResolvedValue(undefined);
  mockGetSnapPickOptions.mockResolvedValue([]);
  mockAddSnapPickOption.mockResolvedValue({
    id: "option-new",
    addedAt: new Date("2025-01-15T00:00:00Z"),
  });
});

describe("GET /api/.../snap-picks/[snapPickId]/options", () => {
  it("returns the pool options for a member", async () => {
    mockGetSnapPickOptions.mockResolvedValue([
      {
        id: "option-1",
        title: "Pizza",
        addedBy: "user-1",
        addedAt: new Date("2025-01-10T00:00:00Z"),
      },
    ]);

    const response = await GET(new Request("http://localhost"), { params });
    const data = (await response.json()) as { options: { id: string }[] };

    expect(response.status).toBe(200);
    expect(data.options[0]?.id).toBe("option-1");
    expect(mockGetSnapPickOptions).toHaveBeenCalledWith("snap-1");
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(undefined);

    const response = await GET(new Request("http://localhost"), { params });

    expect(response.status).toBe(401);
  });

  it("returns 403 for a non-member", async () => {
    mockAuthorizeSnapPickMember.mockResolvedValue(
      NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    );

    const response = await GET(new Request("http://localhost"), { params });

    expect(response.status).toBe(403);
  });

  it("returns 404 when the snap pick does not exist", async () => {
    mockAuthorizeSnapPickMember.mockResolvedValue(
      NextResponse.json({ error: "Snap pick not found" }, { status: 404 }),
    );

    const response = await GET(new Request("http://localhost"), { params });

    expect(response.status).toBe(404);
  });
});

describe("POST /api/.../snap-picks/[snapPickId]/options", () => {
  it("adds an option and returns 201 with the option id", async () => {
    const response = await POST(makeRequest({ title: "Tacos" }), { params });
    const data = (await response.json()) as { optionId: string };

    expect(response.status).toBe(201);
    expect(data.optionId).toBe("option-new");
    expect(mockAddSnapPickOption).toHaveBeenCalledWith("snap-1", {
      title: "Tacos",
      addedBy: "user-1",
    });
  });

  it("trims the title before persisting", async () => {
    await POST(makeRequest({ title: "  Sushi  " }), { params });

    expect(mockAddSnapPickOption).toHaveBeenCalledWith("snap-1", {
      title: "Sushi",
      addedBy: "user-1",
    });
  });

  it("returns 400 when title is missing", async () => {
    const response = await POST(makeRequest({}), { params });

    expect(response.status).toBe(400);
    expect(mockAddSnapPickOption).not.toHaveBeenCalled();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(undefined);

    const response = await POST(makeRequest({ title: "Tacos" }), { params });

    expect(response.status).toBe(401);
  });
});
