import { describe, expect, it, vi } from "vitest";

import {
  buildBody,
  findMarkerComment,
  MARKER,
  pairScreenshots,
  parseNextLink,
} from "../../scripts/post-screenshots-comment.mjs";

interface CommentPage {
  comments: { id: number; body: string }[];
  next?: string;
}

// Build a `fetch` stub whose responses are keyed by request URL, so the
// pagination loop is driven purely by the `Link: <...>; rel="next"` headers
// each real `Response` carries — no network access.
function makeFetch(pages: Record<string, CommentPage>) {
  return vi.fn((url: string) => {
    const page = pages[url];
    if (!page) {
      throw new Error(`unexpected fetch url: ${url}`);
    }
    const headers = new Headers();
    if (page.next) {
      headers.set("link", `<${page.next}>; rel="next"`);
    }
    return Promise.resolve(
      new Response(JSON.stringify(page.comments), { status: 200, headers }),
    );
  });
}

const PAGE_1 =
  "https://api.github.com/repos/o/r/issues/7/comments?per_page=100";
const PAGE_2 =
  "https://api.github.com/repos/o/r/issues/7/comments?per_page=100&page=2";

describe("parseNextLink: extract the rel=next URL", () => {
  it("returns the next-page URL when a rel=next link is present", () => {
    const header =
      '<https://api.github.com/x?page=2>; rel="next", <https://api.github.com/x?page=9>; rel="last"';
    expect(parseNextLink(header)).toBe("https://api.github.com/x?page=2");
  });

  it("returns undefined when there is no rel=next link", () => {
    const header = '<https://api.github.com/x?page=9>; rel="last"';
    expect(parseNextLink(header)).toBeUndefined();
  });

  it("returns undefined for a missing header", () => {
    expect(parseNextLink(null)).toBeUndefined();
  });
});

describe("pairScreenshots: match before/after renders by story id", () => {
  it("flags a story present in both renders as having before and after", () => {
    const pairs = pairScreenshots(["a--modified.png"], ["a--modified.png"]);
    expect(pairs).toEqual([
      {
        file: "a--modified.png",
        name: "a--modified",
        hasBefore: true,
        hasAfter: true,
      },
    ]);
  });

  it("flags a story only in after (new in this PR) as after-only", () => {
    const pairs = pairScreenshots([], ["b--new.png"]);
    expect(pairs).toEqual([
      { file: "b--new.png", name: "b--new", hasBefore: false, hasAfter: true },
    ]);
  });

  it("flags a story only in before (deleted) as before-only", () => {
    const pairs = pairScreenshots(["c--gone.png"], []);
    expect(pairs).toEqual([
      {
        file: "c--gone.png",
        name: "c--gone",
        hasBefore: true,
        hasAfter: false,
      },
    ]);
  });

  it("sorts the union of before and after story ids", () => {
    const pairs = pairScreenshots(["z--old.png"], ["a--new.png", "m--mid.png"]);
    expect(pairs.map((p) => p.name)).toEqual(["a--new", "m--mid", "z--old"]);
  });
});

describe("buildBody: render Before/After pairs", () => {
  const repo = "o/r";
  const branch = "gh-screenshots-pr-7";
  const sha = "abcdef1234567890";

  it("renders a two-column Before | After table for a modified story", () => {
    const body = buildBody(
      repo,
      branch,
      sha,
      ["a--modified.png"],
      ["a--modified.png"],
    );
    expect(body).toContain("| Before | After |");
    expect(body).toContain(
      `https://raw.githubusercontent.com/${repo}/${branch}/before/a--modified.png?v=${sha}`,
    );
    expect(body).toContain(
      `https://raw.githubusercontent.com/${repo}/${branch}/after/a--modified.png?v=${sha}`,
    );
  });

  it("renders a new story as After-only with no before image", () => {
    const body = buildBody(repo, branch, sha, [], ["b--new.png"]);
    expect(body).toContain("<code>b--new</code> — new");
    expect(body).toContain(
      `https://raw.githubusercontent.com/${repo}/${branch}/after/b--new.png?v=${sha}`,
    );
    expect(body).not.toContain("/before/b--new.png");
    expect(body).not.toContain("| Before | After |");
  });

  it("renders a deleted story as Before-only", () => {
    const body = buildBody(repo, branch, sha, ["c--gone.png"], []);
    expect(body).toContain("<code>c--gone</code> — removed");
    expect(body).toContain(
      `https://raw.githubusercontent.com/${repo}/${branch}/before/c--gone.png?v=${sha}`,
    );
    expect(body).not.toContain("/after/c--gone.png");
  });

  it("labels an after-only story as 'after-only' when base render was unavailable", () => {
    const body = buildBody(repo, branch, sha, [], ["b--modified.png"], false);
    expect(body).toContain("<code>b--modified</code> — after-only");
    expect(body).toContain(
      `https://raw.githubusercontent.com/${repo}/${branch}/after/b--modified.png?v=${sha}`,
    );
    expect(body).not.toContain("— new");
  });

  it("uses the unavailable-base description when beforeAvailable is false", () => {
    const body = buildBody(repo, branch, sha, [], ["a.png"], false);
    expect(body).toContain("base render was unavailable");
    expect(body).not.toContain('"Before" is');
  });

  it("includes the sticky marker so the comment can be upserted", () => {
    const body = buildBody(repo, branch, sha, ["a.png"], ["a.png"]);
    expect(body.startsWith(MARKER)).toBe(true);
  });
});

describe("findMarkerComment: paginate past the first page", () => {
  it("finds a marker comment located on page 2", async () => {
    const fetchFn = makeFetch({
      [PAGE_1]: {
        comments: [
          { id: 1, body: "first" },
          { id: 2, body: "second" },
        ],
        next: PAGE_2,
      },
      [PAGE_2]: {
        comments: [
          { id: 3, body: "third" },
          { id: 42, body: `${MARKER}\n## screenshots` },
        ],
      },
    });

    const existing = await findMarkerComment({
      fetchFn,
      repo: "o/r",
      pr: "7",
      token: "t",
    });

    expect(existing?.id).toBe(42);
    // Both pages must have been fetched to reach the page-2 marker.
    expect(fetchFn).toHaveBeenCalledTimes(2);
    expect(fetchFn).toHaveBeenNthCalledWith(1, PAGE_1, expect.anything());
    expect(fetchFn).toHaveBeenNthCalledWith(2, PAGE_2, expect.anything());
  });

  it("returns undefined when no page contains the marker", async () => {
    const fetchFn = makeFetch({
      [PAGE_1]: { comments: [{ id: 1, body: "a" }], next: PAGE_2 },
      [PAGE_2]: { comments: [{ id: 2, body: "b" }] },
    });

    const existing = await findMarkerComment({
      fetchFn,
      repo: "o/r",
      pr: "7",
      token: "t",
    });

    expect(existing).toBeUndefined();
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
