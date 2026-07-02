import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Breadcrumbs } from "./Breadcrumbs";
import { BREADCRUMBS_COPY } from "./Breadcrumbs.copy";

afterEach(cleanup);

const trail = [
  { label: "Movie Night", href: "/groups/group-1" },
  { label: "Best Movies", href: "/groups/group-1/categories/cat-1" },
  {
    label: "Top 3 of 2025",
    href: "/groups/group-1/categories/cat-1/picks/pick-1",
  },
];

describe("Breadcrumbs — reusable component", () => {
  it("renders a labelled navigation landmark", () => {
    render(<Breadcrumbs crumbs={trail} />);

    expect(
      screen.getByRole("navigation", { name: BREADCRUMBS_COPY.navLabel }),
    ).toBeDefined();
  });

  it("renders a crumb for every supplied entry", () => {
    render(<Breadcrumbs crumbs={trail} />);

    expect(screen.getByText("Movie Night")).toBeDefined();
    expect(screen.getByText("Best Movies")).toBeDefined();
    expect(screen.getByText("Top 3 of 2025")).toBeDefined();
  });
});

describe("Breadcrumbs — data-driven trails", () => {
  it("renders an arbitrary trail of two crumbs", () => {
    render(<Breadcrumbs crumbs={trail.slice(0, 2)} />);

    expect(screen.getByText("Movie Night")).toBeDefined();
    expect(screen.getByText("Best Movies")).toBeDefined();
    expect(screen.queryByText("Top 3 of 2025")).toBeNull();
  });

  it("renders a single-crumb trail", () => {
    render(<Breadcrumbs crumbs={[trail[0]!]} />);

    expect(screen.getByText("Movie Night")).toBeDefined();
  });
});

describe("Breadcrumbs — links and current crumb", () => {
  it("links every non-final crumb to its route", () => {
    render(<Breadcrumbs crumbs={trail} />);

    const groupLink = screen.getByRole("link", { name: "Movie Night" });
    expect(groupLink.getAttribute("href")).toBe("/groups/group-1");

    const categoryLink = screen.getByRole("link", { name: "Best Movies" });
    expect(categoryLink.getAttribute("href")).toBe(
      "/groups/group-1/categories/cat-1",
    );
  });

  it("marks the final crumb as the current page and non-interactive", () => {
    render(<Breadcrumbs crumbs={trail} />);

    const current = screen.getByText("Top 3 of 2025");
    expect(current.getAttribute("aria-current")).toBe("page");
    expect(current.getAttribute("aria-disabled")).toBe("true");
    expect(current.tagName).toBe("SPAN");
    expect(current.getAttribute("href")).toBeNull();
  });
});
