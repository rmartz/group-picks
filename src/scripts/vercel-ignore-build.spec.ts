import { describe, expect, it } from "vitest";

import { shouldBuild } from "../../scripts/vercel-ignore-build.mjs";

describe("shouldBuild: production only", () => {
  it("builds a production deploy", () => {
    expect(shouldBuild({ VERCEL_ENV: "production" })).toBe(true);
  });

  it("cancels a preview deploy (previews come from the label workflow)", () => {
    expect(shouldBuild({ VERCEL_ENV: "preview" })).toBe(false);
  });

  it("cancels a development deploy", () => {
    expect(shouldBuild({ VERCEL_ENV: "development" })).toBe(false);
  });

  it("cancels when VERCEL_ENV is absent", () => {
    expect(shouldBuild({})).toBe(false);
  });
});
