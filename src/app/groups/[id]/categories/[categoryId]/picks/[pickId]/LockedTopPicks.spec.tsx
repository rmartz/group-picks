import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { LockedTopPicks } from "./LockedTopPicks";
import { LOCKED_TOP_PICKS_COPY } from "./LockedTopPicks.copy";

afterEach(cleanup);

describe("LockedTopPicks", () => {
  it("renders the lock icon, title, explanation, and admin note", () => {
    render(<LockedTopPicks rankedCount={2} memberCount={5} />);

    expect(screen.getByText(LOCKED_TOP_PICKS_COPY.lockIcon)).toBeDefined();
    expect(screen.getByText(LOCKED_TOP_PICKS_COPY.title)).toBeDefined();
    expect(screen.getByText(LOCKED_TOP_PICKS_COPY.explanation)).toBeDefined();
    expect(screen.getByText(LOCKED_TOP_PICKS_COPY.adminNote)).toBeDefined();
  });

  it("renders a progress bar reflecting how many members have ranked", () => {
    render(<LockedTopPicks rankedCount={3} memberCount={4} />);

    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("3");
    expect(bar.getAttribute("aria-valuemax")).toBe("4");
    expect(bar.getAttribute("aria-valuetext")).toBe(
      `3 ${LOCKED_TOP_PICKS_COPY.progressConnector} 4 ${LOCKED_TOP_PICKS_COPY.progressSuffix}`,
    );
  });

  it("renders a deterministic countdown from dueDate and now", () => {
    render(
      <LockedTopPicks
        rankedCount={1}
        memberCount={2}
        dueDate={new Date("2025-06-03T00:00:00.000Z")}
        now={new Date("2025-06-01T00:00:00.000Z")}
      />,
    );

    const countdown = screen.getByText(
      new RegExp(
        `${LOCKED_TOP_PICKS_COPY.closesPrefix}.*2 ${LOCKED_TOP_PICKS_COPY.units.days} ${LOCKED_TOP_PICKS_COPY.remainingSuffix}`,
      ),
    );
    expect(countdown).toBeDefined();
  });

  it("renders an hours-based countdown when less than a day remains", () => {
    render(
      <LockedTopPicks
        rankedCount={1}
        memberCount={2}
        dueDate={new Date("2025-06-01T05:00:00.000Z")}
        now={new Date("2025-06-01T00:00:00.000Z")}
      />,
    );

    expect(
      screen.getByText(
        new RegExp(
          `5 ${LOCKED_TOP_PICKS_COPY.units.hours} ${LOCKED_TOP_PICKS_COPY.remainingSuffix}`,
        ),
      ),
    ).toBeDefined();
  });

  it("shows the closing-now label when the due date has passed", () => {
    render(
      <LockedTopPicks
        rankedCount={2}
        memberCount={2}
        dueDate={new Date("2025-05-31T00:00:00.000Z")}
        now={new Date("2025-06-01T00:00:00.000Z")}
      />,
    );

    expect(
      screen.getByText(new RegExp(LOCKED_TOP_PICKS_COPY.dueNow)),
    ).toBeDefined();
  });

  it("shows a fallback when no due date is set", () => {
    render(<LockedTopPicks rankedCount={0} memberCount={3} />);

    expect(screen.getByText(LOCKED_TOP_PICKS_COPY.noDueDate)).toBeDefined();
  });
});
