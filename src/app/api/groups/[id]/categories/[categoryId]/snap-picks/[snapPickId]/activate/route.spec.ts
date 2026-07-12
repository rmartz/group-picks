import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetVerifiedUid,
  mockAuthorizeSnapPickMember,
  mockGetOpenActivation,
  mockCreateSnapPickActivation,
} = vi.hoisted(() => ({
  mockGetVerifiedUid: vi.fn(),
  mockAuthorizeSnapPickMember: vi.fn(),
  mockGetOpenActivation: vi.fn(),
  mockCreateSnapPickActivation: vi.fn(),
}));

vi.mock("@/server/utils/auth", () => ({
  getVerifiedUid: mockGetVerifiedUid,
}));

vi.mock("@/server/utils/snap-pick-auth", () => ({
  authorizeSnapPickMember: mockAuthorizeSnapPickMember,
}));

vi.mock("@/server/data/snap-pick-activations", () => ({
  getOpenActivation: mockGetOpenActivation,
  createSnapPickActivation: mockCreateSnapPickActivation,
}));

const { PUT } = await import("./route");

const params = Promise.resolve({
  id: "group-1",
  categoryId: "cat-1",
  snapPickId: "snap-1",
});

function makeRequest(body: unknown) {
  return new Request(
    "http://localhost/api/groups/group-1/categories/cat-1/snap-picks/snap-1/activate",
    {
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetVerifiedUid.mockResolvedValue("user-1");
  mockAuthorizeSnapPickMember.mockResolvedValue(undefined);
  mockGetOpenActivation.mockResolvedValue(undefined);
  mockCreateSnapPickActivation.mockResolvedValue({ id: "act-new" });
});

describe("PUT /api/.../snap-picks/[snapPickId]/activate", () => {
  it("creates an activation and returns 201 with the activation id", async () => {
    const response = await PUT(
      makeRequest({ duration: { kind: "preset", preset: "1-hour" } }),
      { params },
    );
    const data = (await response.json()) as { activationId: string };

    expect(response.status).toBe(201);
    expect(data.activationId).toBe("act-new");
    expect(mockCreateSnapPickActivation).toHaveBeenCalledWith(
      expect.objectContaining({ snapPickId: "snap-1", startedBy: "user-1" }),
    );
  });

  it("accepts a custom duration span", async () => {
    const response = await PUT(
      makeRequest({ duration: { kind: "custom", durationMs: 5_400_000 } }),
      { params },
    );

    expect(response.status).toBe(201);
    expect(mockCreateSnapPickActivation).toHaveBeenCalledTimes(1);
  });

  it("returns 400 for an unknown duration preset", async () => {
    const response = await PUT(
      makeRequest({ duration: { kind: "preset", preset: "8-hours" } }),
      { params },
    );

    expect(response.status).toBe(400);
    expect(mockCreateSnapPickActivation).not.toHaveBeenCalled();
  });

  it("returns 400 for an Infinity custom duration", async () => {
    // Use a raw JSON string so 1e309 parses to Infinity server-side without
    // triggering the no-loss-of-precision lint rule on a JS numeric literal.
    const request = new Request(
      "http://localhost/api/groups/group-1/categories/cat-1/snap-picks/snap-1/activate",
      {
        method: "PUT",
        body: '{"duration":{"kind":"custom","durationMs":1e309}}',
        headers: { "content-type": "application/json" },
      },
    );
    const response = await PUT(request, { params });

    expect(response.status).toBe(400);
    expect(mockCreateSnapPickActivation).not.toHaveBeenCalled();
  });

  it("returns 409 when an activation is already in progress", async () => {
    mockGetOpenActivation.mockResolvedValue({ id: "act-open" });

    const response = await PUT(
      makeRequest({ duration: { kind: "preset", preset: "same-day" } }),
      { params },
    );

    expect(response.status).toBe(409);
    expect(mockCreateSnapPickActivation).not.toHaveBeenCalled();
  });

  it("returns 403 for a non-member", async () => {
    mockAuthorizeSnapPickMember.mockResolvedValue(
      NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    );

    const response = await PUT(
      makeRequest({ duration: { kind: "preset", preset: "1-hour" } }),
      { params },
    );

    expect(response.status).toBe(403);
    expect(mockCreateSnapPickActivation).not.toHaveBeenCalled();
  });

  it("returns 401 when unauthenticated", async () => {
    mockGetVerifiedUid.mockResolvedValue(undefined);

    const response = await PUT(
      makeRequest({ duration: { kind: "preset", preset: "1-hour" } }),
      { params },
    );

    expect(response.status).toBe(401);
  });
});
