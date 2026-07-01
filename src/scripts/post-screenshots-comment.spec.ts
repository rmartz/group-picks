import { describe, expect, it, vi } from "vitest";

import {
  findMarkerComment,
  MARKER,
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
