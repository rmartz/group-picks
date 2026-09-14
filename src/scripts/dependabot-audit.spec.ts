import { describe, expect, it } from "vitest";

import {
  buildReport,
  type DependabotPr,
  type OtherPr,
} from "../../scripts/dependabot-audit.mjs";

function makeDepPr(overrides: Partial<DependabotPr> = {}): DependabotPr {
  return {
    number: 1,
    title: "bump some-pkg from 1.0.0 to 2.0.0",
    state: "MERGED",
    statusCheckRollup: [],
    ...overrides,
  };
}

function makeOtherPr(overrides: Partial<OtherPr> = {}): OtherPr {
  return {
    number: 99,
    title: "Fix something",
    state: "MERGED",
    body: "",
    author: { login: "human-user" },
    ...overrides,
  };
}

const REPO = "rmartz/group-picks";

describe("buildReport: group classification", () => {
  it("classifies a named-group PR", () => {
    const pr = makeDepPr({
      title: "bump the dev-dependencies group with 3 updates",
    });
    const { rows } = buildReport([pr], [], REPO);
    expect(rows[0]?.group).toBe("dev-dependencies");
  });

  it("classifies a github-actions named-group PR", () => {
    const pr = makeDepPr({
      title: "bump the github-actions group with 2 updates",
    });
    const { rows } = buildReport([pr], [], REPO);
    expect(rows[0]?.group).toBe("github-actions");
  });

  it("classifies an ungrouped GitHub Actions ecosystem bump as github-actions", () => {
    const pr = makeDepPr({ title: "bump actions/checkout from 3 to 4" });
    const { rows } = buildReport([pr], [], REPO);
    expect(rows[0]?.group).toBe("github-actions");
  });

  it("classifies an ungrouped npm bump as individual", () => {
    const pr = makeDepPr({ title: "bump react from 18.0.0 to 19.0.0" });
    const { rows } = buildReport([pr], [], REPO);
    expect(rows[0]?.group).toBe("individual");
  });
});

describe("buildReport: outcome classification", () => {
  it("classifies a merged PR with no fix as clean", () => {
    const { rows } = buildReport([makeDepPr({ state: "MERGED" })], [], REPO);
    expect(rows[0]?.outcome).toBe("clean");
  });

  it("classifies an open green PR as pending", () => {
    const { rows } = buildReport(
      [makeDepPr({ state: "OPEN", statusCheckRollup: [] })],
      [],
      REPO,
    );
    expect(rows[0]?.outcome).toBe("pending");
  });

  it("classifies an open red PR as stuck", () => {
    const pr = makeDepPr({
      state: "OPEN",
      statusCheckRollup: [{ conclusion: "FAILURE", state: "FAILURE" }],
    });
    const { rows } = buildReport([pr], [], REPO);
    expect(rows[0]?.outcome).toBe("stuck");
  });

  it("classifies a closed non-merged PR as churn", () => {
    const { rows } = buildReport([makeDepPr({ state: "CLOSED" })], [], REPO);
    expect(rows[0]?.outcome).toBe("churn");
  });

  it("counts pending PRs in the group bucket", () => {
    const pr = makeDepPr({ state: "OPEN", statusCheckRollup: [] });
    const { groups } = buildReport([pr], [], REPO);
    expect(groups.get("individual")?.pending).toBe(1);
  });
});

describe("buildReport: fix attribution", () => {
  it("attributes a fix via the dependabot token in the fix PR title", () => {
    const depPr = makeDepPr({ number: 100, state: "MERGED" });
    const fixPr = makeOtherPr({
      number: 200,
      title: "Fix CI for Dependabot PR 100",
    });
    const { rows } = buildReport([depPr], [fixPr], REPO);
    expect(rows[0]?.outcome).toBe("needed-fix");
    expect(rows[0]?.fixes).toContain(200);
  });

  it("attributes a fix via a same-repo /pull/N URL when the body mentions dependabot", () => {
    const depPr = makeDepPr({ number: 100, state: "MERGED" });
    const fixPr = makeOtherPr({
      number: 200,
      title: "Fix failing dependabot build",
      body: `Fixes https://github.com/${REPO}/pull/100`,
    });
    const { rows } = buildReport([depPr], [fixPr], REPO);
    expect(rows[0]?.outcome).toBe("needed-fix");
  });

  it("rejects a cross-repo /pull/N URL even when the body mentions dependabot", () => {
    const depPr = makeDepPr({ number: 100, state: "MERGED" });
    const fixPr = makeOtherPr({
      number: 200,
      title: "Fix failing dependabot build",
      body: "See https://github.com/other-owner/other-repo/pull/100",
    });
    const { rows } = buildReport([depPr], [fixPr], REPO);
    expect(rows[0]?.outcome).toBe("clean");
  });

  it("does not count a closed (non-merged) fix PR", () => {
    const depPr = makeDepPr({ number: 100, state: "MERGED" });
    const fixPr = makeOtherPr({
      number: 200,
      title: "Fix for Dependabot #100",
      state: "CLOSED",
    });
    const { rows } = buildReport([depPr], [fixPr], REPO);
    expect(rows[0]?.outcome).toBe("clean");
  });
});
