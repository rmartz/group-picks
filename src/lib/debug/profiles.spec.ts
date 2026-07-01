import { afterEach, describe, expect, it, vi } from "vitest";

import { findDebugProfile, isDebugAuthEnabled } from "./profiles";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("isDebugAuthEnabled gates the debug switcher", () => {
  it("is enabled when the flag is set and not in production", () => {
    vi.stubEnv("NEXT_PUBLIC_DEBUG_AUTH", "true");
    vi.stubEnv("VERCEL_ENV", "preview");

    expect(isDebugAuthEnabled()).toBe(true);
  });

  it("is disabled in production even when the flag is set", () => {
    vi.stubEnv("NEXT_PUBLIC_DEBUG_AUTH", "true");
    vi.stubEnv("VERCEL_ENV", "production");

    expect(isDebugAuthEnabled()).toBe(false);
  });

  it("is disabled when the flag is not exactly 'true'", () => {
    vi.stubEnv("NEXT_PUBLIC_DEBUG_AUTH", "");
    vi.stubEnv("VERCEL_ENV", "preview");

    expect(isDebugAuthEnabled()).toBe(false);
  });
});

describe("findDebugProfile", () => {
  it("returns the profile for a known id", () => {
    expect(findDebugProfile("debug-alice")?.displayName).toBe("Alice (debug)");
  });

  it("returns undefined for an unknown id", () => {
    expect(findDebugProfile("nope")).toBeUndefined();
  });
});
