import { describe, expect, it } from "vitest";

import { findUnpinnedActions } from "../../scripts/check-action-pins.mjs";

const SHA = "9c091bb21b7c1c1d1991bb908d89e4e9dddfe3e0";

describe("findUnpinnedActions: flags tag-pinned third-party actions", () => {
  it("flags a bare major tag", () => {
    const offenders = findUnpinnedActions("      - uses: actions/checkout@v7");
    expect(offenders).toHaveLength(1);
    expect(offenders[0]?.uses).toBe("actions/checkout@v7");
  });

  it("flags a full-semver tag (still mutable, still flagged)", () => {
    expect(findUnpinnedActions("- uses: actions/checkout@v7.0.0")).toHaveLength(
      1,
    );
  });

  it("reports the 1-based line number", () => {
    const content = [
      "jobs:",
      "  steps:",
      "    - uses: pnpm/action-setup@v5",
    ].join("\n");
    const offenders = findUnpinnedActions(content);
    expect(offenders[0]?.line).toBe(3);
  });
});

describe("findUnpinnedActions: requires a full major.minor.patch comment", () => {
  it("flags a SHA pin with no trailing comment", () => {
    const offenders = findUnpinnedActions(`- uses: actions/checkout@${SHA}`);
    expect(offenders).toHaveLength(1);
    expect(offenders[0]?.reason).toMatch(/version comment/);
  });

  it("flags a SHA pin whose comment is not a version", () => {
    expect(
      findUnpinnedActions(`- uses: actions/checkout@${SHA} # pinned`),
    ).toHaveLength(1);
  });

  it("flags a major-only version comment (Dependabot is inconsistent on these)", () => {
    expect(
      findUnpinnedActions(`- uses: actions/checkout@${SHA} # v7`),
    ).toHaveLength(1);
  });

  it("flags a major.minor version comment (no patch)", () => {
    expect(
      findUnpinnedActions(`- uses: actions/checkout@${SHA} # v7.0`),
    ).toHaveLength(1);
  });
});

describe("findUnpinnedActions: accepts SHA-pinned actions with a version comment", () => {
  it("accepts a 40-char SHA with a version comment", () => {
    expect(
      findUnpinnedActions(`      - uses: actions/checkout@${SHA} # v7.0.0`),
    ).toEqual([]);
  });

  it("accepts a SHA on a reusable-workflow ref with a version comment", () => {
    expect(
      findUnpinnedActions(
        `- uses: owner/repo/.github/workflows/x.yml@${SHA} # v1.2.3`,
      ),
    ).toEqual([]);
  });
});

describe("findUnpinnedActions: exempt uses values", () => {
  it("ignores a local composite action (no @ref)", () => {
    expect(
      findUnpinnedActions("      - uses: ./.github/actions/setup"),
    ).toEqual([]);
  });

  it("ignores a commented-out uses line", () => {
    expect(findUnpinnedActions("      # - uses: actions/checkout@v7")).toEqual(
      [],
    );
  });

  it("ignores a docker image ref", () => {
    expect(findUnpinnedActions("- uses: docker://alpine:3.20")).toEqual([]);
  });
});
