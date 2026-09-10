import { describe, expect, it } from "vitest";

import { frontmatterViolations } from "../../scripts/validate-docs.mjs";

const CONTENT_PAGE = [
  "---",
  "type: Domain",
  "title: Invites",
  "description: Token-based group invites.",
  "---",
  "",
  "# Invites",
].join("\n");

describe("frontmatterViolations: index.md is exempt from the OKF frontmatter requirement (OKF §8/§11)", () => {
  it("accepts a root index.md with no frontmatter", () => {
    expect(frontmatterViolations("index.md", "# Knowledge base\n")).toEqual([]);
  });

  it("accepts an index.md carrying only okf_version", () => {
    const content = ["---", 'okf_version: "0.2"', "---", "", "# Base"].join(
      "\n",
    );
    expect(frontmatterViolations("index.md", content)).toEqual([]);
  });

  it("accepts a subdirectory index.md with no frontmatter", () => {
    expect(frontmatterViolations("guides/index.md", "# Guides\n")).toEqual([]);
  });
});

describe("frontmatterViolations: index.md rejects any frontmatter beyond okf_version", () => {
  it("rejects a `type` key on index.md", () => {
    const content = ["---", "type: Index", "---", "", "# Base"].join("\n");
    const violations = frontmatterViolations("index.md", content);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatch(/okf_version/);
    expect(violations[0]).toMatch(/type/);
  });

  it("names every disallowed key when index.md carries a full content-page block", () => {
    const content = [
      "---",
      "type: Index",
      "title: group-picks knowledge base",
      "description: Reference knowledge.",
      "tags: [okf, index]",
      "---",
      "",
      "# Base",
    ].join("\n");
    const violations = frontmatterViolations("index.md", content);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatch(/description/);
    expect(violations[0]).toMatch(/tags/);
    expect(violations[0]).toMatch(/title/);
    expect(violations[0]).toMatch(/type/);
  });

  it("rejects a disallowed key even alongside okf_version", () => {
    const content = [
      "---",
      'okf_version: "0.2"',
      "tags: [okf]",
      "---",
      "",
      "# Base",
    ].join("\n");
    const violations = frontmatterViolations("index.md", content);
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatch(/tags/);
    // okf_version is allowed, so it must not appear among the disallowed keys.
    expect(violations[0]).not.toMatch(/disallowed:[^)]*okf_version/);
  });
});

describe("frontmatterViolations: content (non-index) pages still require a valid OKF type", () => {
  it("accepts a content page with a valid type, title, and description", () => {
    expect(frontmatterViolations("invites.md", CONTENT_PAGE)).toEqual([]);
  });

  it("flags a content page missing frontmatter entirely", () => {
    const violations = frontmatterViolations("invites.md", "# Invites\n");
    expect(violations).toHaveLength(1);
    expect(violations[0]).toMatch(/missing frontmatter/);
  });

  it("flags a content page missing `type`", () => {
    const content = [
      "---",
      "title: Invites",
      "description: Token-based group invites.",
      "---",
      "",
      "# Invites",
    ].join("\n");
    const violations = frontmatterViolations("invites.md", content);
    expect(violations).toContainEqual(expect.stringMatching(/missing `type`/));
  });

  it("flags `type: Index` on a content page — Index is no longer a vocabulary type", () => {
    const content = [
      "---",
      "type: Index",
      "title: Invites",
      "description: Token-based group invites.",
      "---",
      "",
      "# Invites",
    ].join("\n");
    const violations = frontmatterViolations("invites.md", content);
    expect(violations).toContainEqual(
      expect.stringMatching(/invalid `type: Index`/),
    );
  });
});
