import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { makeSnapPick, makeSnapPickActivation } from "@/lib/fixtures/snap-pick";
import type { ActiveSnapPickActivation } from "@/lib/types/snap-pick";

import { ActiveSnapPickList } from "./ActiveSnapPickList";

afterEach(cleanup);

describe("ActiveSnapPickList", () => {
  it("filters out activations whose closesAt has already passed", () => {
    const expiredActivation: ActiveSnapPickActivation = {
      snapPick: makeSnapPick({ id: "snap-expired", title: "Expired Pick" }),
      activation: makeSnapPickActivation({
        id: "act-expired",
        closesAt: new Date("2020-01-01T00:00:00.000Z"),
      }),
    };
    const activeActivation: ActiveSnapPickActivation = {
      snapPick: makeSnapPick({ id: "snap-active", title: "Active Pick" }),
      activation: makeSnapPickActivation({
        id: "act-active",
        closesAt: new Date("2099-01-01T00:00:00.000Z"),
      }),
    };

    render(
      <ActiveSnapPickList
        groupId="group-1"
        activations={[expiredActivation, activeActivation]}
        categories={[]}
      />,
    );

    expect(screen.queryByText("Expired Pick")).toBeNull();
    expect(screen.getByText("Active Pick")).toBeDefined();
  });
});
