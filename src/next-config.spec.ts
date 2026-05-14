import { beforeEach, describe, expect, it, vi } from "vitest";

const mockWithSentryConfig = vi
  .fn()
  .mockImplementation((config: object) => config);

vi.mock("@sentry/nextjs", () => ({
  withSentryConfig: mockWithSentryConfig,
}));

beforeEach(() => {
  mockWithSentryConfig.mockClear();
  vi.resetModules();
});

async function loadNextConfig() {
  await import("../next.config");
  return mockWithSentryConfig.mock.calls[0]?.[1] as Record<string, unknown>;
}

describe("Source maps: deleteSourcemapsAfterUpload is enabled", () => {
  it("calls withSentryConfig with sourcemaps.deleteSourcemapsAfterUpload: true to prevent end-user exposure", async () => {
    const options = await loadNextConfig();
    expect(options).toMatchObject({
      sourcemaps: { deleteSourcemapsAfterUpload: true },
    });
  });
});

describe("Source maps: debug statements are excluded from bundle", () => {
  it("calls withSentryConfig with bundleSizeOptimizations.excludeDebugStatements: true", async () => {
    const options = await loadNextConfig();
    expect(options).toMatchObject({
      bundleSizeOptimizations: { excludeDebugStatements: true },
    });
  });
});

describe("Source maps: widenClientFileUpload is enabled", () => {
  it("calls withSentryConfig with widenClientFileUpload: true for broader source map coverage", async () => {
    const options = await loadNextConfig();
    expect(options).toMatchObject({
      widenClientFileUpload: true,
    });
  });
});
