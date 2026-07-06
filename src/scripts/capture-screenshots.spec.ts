import { describe, expect, it } from "vitest";

import {
  filterStoriesByChangedFiles,
  parseArgs,
  parseChangedFiles,
  resolveDeadlineMs,
  storiesFromIndex,
  type StorybookIndex,
  type StoryEntry,
} from "../../scripts/capture-screenshots.mjs";

function makeStory(overrides: Partial<StoryEntry> = {}): StoryEntry {
  return {
    id: "components-button--primary",
    type: "story",
    importPath: "./src/components/Button.stories.tsx",
    ...overrides,
  };
}

function makeIndex(entries: StoryEntry[]): StorybookIndex {
  return {
    entries: Object.fromEntries(entries.map((entry) => [entry.id, entry])),
  };
}

describe("parseArgs: default values", () => {
  it("defaults staticDir and out when no flags are given", () => {
    const args = parseArgs([]);
    expect(args.staticDir).toBe("storybook-static");
    expect(args.out).toBe("screenshots");
    expect(args.changedFiles).toBeUndefined();
  });
});

describe("parseArgs: explicit flags", () => {
  it("reads --static-dir, --out, and --changed-files values", () => {
    const args = parseArgs([
      "--static-dir=build/sb",
      "--out=shots",
      "--changed-files=changed.txt",
    ]);
    expect(args.staticDir).toBe("build/sb");
    expect(args.out).toBe("shots");
    expect(args.changedFiles).toBe("changed.txt");
  });
});

describe("storiesFromIndex: keep only story entries", () => {
  it("drops non-story entries from the index", () => {
    const index = makeIndex([
      makeStory({ id: "a--story", type: "story" }),
      makeStory({ id: "b--docs", type: "docs" }),
      makeStory({ id: "c--story", type: "story" }),
    ]);
    expect(storiesFromIndex(index).map((entry) => entry.id)).toEqual([
      "a--story",
      "c--story",
    ]);
  });
});

describe("parseChangedFiles: normalize the changed-files list", () => {
  it("trims each line and drops blank lines", () => {
    const contents = "  src/a.stories.tsx  \n\n\tsrc/b.stories.tsx\n   \n";
    expect(parseChangedFiles(contents)).toEqual([
      "src/a.stories.tsx",
      "src/b.stories.tsx",
    ]);
  });
});

describe("filterStoriesByChangedFiles: match stories to changed files", () => {
  it("keeps only stories whose importPath is in the changed set", () => {
    const stories = [
      makeStory({
        id: "button--primary",
        importPath: "./src/components/Button.stories.tsx",
      }),
      makeStory({
        id: "card--default",
        importPath: "./src/components/Card.stories.tsx",
      }),
    ];
    const filtered = filterStoriesByChangedFiles(stories, [
      "src/components/Card.stories.tsx",
    ]);
    expect(filtered.map((entry) => entry.id)).toEqual(["card--default"]);
  });

  it("strips the leading ./ from importPath before comparing", () => {
    const stories = [
      makeStory({
        id: "button--primary",
        importPath: "./src/components/Button.stories.tsx",
      }),
    ];
    const filtered = filterStoriesByChangedFiles(stories, [
      "src/components/Button.stories.tsx",
    ]);
    expect(filtered.map((entry) => entry.id)).toEqual(["button--primary"]);
  });

  it("returns an empty list when no story matches a changed file", () => {
    const stories = [
      makeStory({
        id: "button--primary",
        importPath: "./src/components/Button.stories.tsx",
      }),
    ];
    expect(
      filterStoriesByChangedFiles(stories, [
        "src/components/Other.stories.tsx",
      ]),
    ).toEqual([]);
  });
});

describe("resolveDeadlineMs: wall-clock budget from the environment", () => {
  it("uses the default when CAPTURE_DEADLINE_MS is unset", () => {
    expect(resolveDeadlineMs({})).toBe(240_000);
  });

  it("reads a positive numeric override", () => {
    expect(resolveDeadlineMs({ CAPTURE_DEADLINE_MS: "5000" })).toBe(5000);
  });

  it("falls back to the default for non-positive or non-numeric values", () => {
    expect(resolveDeadlineMs({ CAPTURE_DEADLINE_MS: "0" })).toBe(240_000);
    expect(resolveDeadlineMs({ CAPTURE_DEADLINE_MS: "-1" })).toBe(240_000);
    expect(resolveDeadlineMs({ CAPTURE_DEADLINE_MS: "abc" })).toBe(240_000);
  });
});
