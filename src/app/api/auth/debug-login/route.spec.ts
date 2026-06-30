import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { mockCreateCustomToken } = vi.hoisted(() => ({
  mockCreateCustomToken: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminAuth: () => ({ createCustomToken: mockCreateCustomToken }),
}));

const { POST } = await import("./route");

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/auth/debug-login", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json" },
  });
}

describe("POST /api/auth/debug-login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateCustomToken.mockResolvedValue("custom-token-xyz");
    vi.stubEnv("NEXT_PUBLIC_DEBUG_AUTH", "true");
    vi.stubEnv("VERCEL_ENV", "preview");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns 404 in production (gate disabled), minting no token", async () => {
    vi.stubEnv("VERCEL_ENV", "production");

    const response = await POST(makeRequest({ profileId: "debug-alice" }));

    expect(response.status).toBe(404);
    expect(mockCreateCustomToken).not.toHaveBeenCalled();
  });

  it("mints a custom token for a known profile when enabled", async () => {
    const response = await POST(makeRequest({ profileId: "debug-alice" }));

    expect(response.status).toBe(200);
    const data = (await response.json()) as { customToken: string };
    expect(data.customToken).toBe("custom-token-xyz");
    expect(mockCreateCustomToken).toHaveBeenCalledWith("debug-alice");
  });

  it("returns 400 for an unknown profile", async () => {
    const response = await POST(makeRequest({ profileId: "ghost" }));

    expect(response.status).toBe(400);
    expect(mockCreateCustomToken).not.toHaveBeenCalled();
  });

  it("returns 400 when profileId is missing", async () => {
    const response = await POST(makeRequest({}));

    expect(response.status).toBe(400);
    expect(mockCreateCustomToken).not.toHaveBeenCalled();
  });
});
