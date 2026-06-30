import { describe, expect, it } from "vitest";

import { isDeployableTitle } from "../../scripts/vercel-ignore-build.mjs";

describe("isDeployableTitle: feat titles", () => {
  it("returns true for a plain feat: title", () => {
    expect(isDeployableTitle("feat: add user profile")).toBe(true);
  });

  it("returns true for a feat: title with a scope", () => {
    expect(isDeployableTitle("feat(api): add endpoint")).toBe(true);
  });

  it("returns true for a feat!: title with the breaking-change marker", () => {
    expect(isDeployableTitle("feat!: remove legacy auth")).toBe(true);
  });

  it("returns true for a feat(scope)!: title with scope and breaking-change marker", () => {
    expect(isDeployableTitle("feat(api)!: remove v1 routes")).toBe(true);
  });

  it("returns true for a FEAT: title (case-insensitive)", () => {
    expect(isDeployableTitle("FEAT: uppercase type")).toBe(true);
  });
});

describe("isDeployableTitle: fix titles", () => {
  it("returns true for a plain fix: title", () => {
    expect(isDeployableTitle("fix: resolve login bug")).toBe(true);
  });

  it("returns true for a fix: title with a scope", () => {
    expect(isDeployableTitle("fix(ui): correct button color")).toBe(true);
  });

  it("returns true for a fix!: title with the breaking-change marker", () => {
    expect(isDeployableTitle("fix!: remove deprecated endpoint")).toBe(true);
  });

  it("returns true for a Fix: title (case-insensitive)", () => {
    expect(isDeployableTitle("Fix: mixed-case type")).toBe(true);
  });
});

describe("isDeployableTitle: non-deployable types", () => {
  it("returns false for a chore: title", () => {
    expect(isDeployableTitle("chore: update dependencies")).toBe(false);
  });

  it("returns false for a ci: title", () => {
    expect(isDeployableTitle("ci: add lint job")).toBe(false);
  });

  it("returns false for a docs: title", () => {
    expect(isDeployableTitle("docs: update README")).toBe(false);
  });

  it("returns false for a refactor: title", () => {
    expect(isDeployableTitle("refactor: reorganize modules")).toBe(false);
  });

  it("returns false for a test: title", () => {
    expect(isDeployableTitle("test: add unit tests")).toBe(false);
  });

  it("returns false for a style: title", () => {
    expect(isDeployableTitle("style: format files")).toBe(false);
  });

  it("returns false for a perf: title", () => {
    expect(isDeployableTitle("perf: optimize render")).toBe(false);
  });

  it("returns false for a revert: title", () => {
    expect(isDeployableTitle("revert: undo last commit")).toBe(false);
  });

  it("returns false for a build: title", () => {
    expect(isDeployableTitle("build: upgrade webpack")).toBe(false);
  });
});

describe("isDeployableTitle: [WIP] prefix", () => {
  it("returns false for a [WIP] feat: title", () => {
    expect(isDeployableTitle("[WIP] feat: draft work")).toBe(false);
  });

  it("returns false for a [WIP] fix: title", () => {
    expect(isDeployableTitle("[WIP] fix: draft fix")).toBe(false);
  });
});

describe("isDeployableTitle: edge cases", () => {
  it("returns false for an empty string", () => {
    expect(isDeployableTitle("")).toBe(false);
  });

  it("returns false for null", () => {
    expect(isDeployableTitle(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isDeployableTitle(undefined)).toBe(false);
  });

  it("trims leading and trailing whitespace before matching", () => {
    expect(isDeployableTitle("  feat: padded title  ")).toBe(true);
  });
});
