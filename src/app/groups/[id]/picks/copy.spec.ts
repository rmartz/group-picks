import { describe, it, expect } from "vitest";
import { OPTION_LIST_COPY } from "./copy";

describe("ownerCount dead copy entries removed", () => {
  it("does not have an ownerCount key", () => {
    expect("ownerCount" in OPTION_LIST_COPY).toBe(false);
  });
});

describe("OPTION_LIST_COPY active keys are preserved", () => {
  it("retains suggestFormLabel", () => {
    expect(OPTION_LIST_COPY.suggestFormLabel).toBeDefined();
  });

  it("retains suggestPlaceholder", () => {
    expect(OPTION_LIST_COPY.suggestPlaceholder).toBeDefined();
  });

  it("retains suggestButton", () => {
    expect(OPTION_LIST_COPY.suggestButton).toBeDefined();
  });

  it("retains errors.default", () => {
    expect(OPTION_LIST_COPY.errors.default).toBeDefined();
  });

  it("retains heart.markInterested", () => {
    expect(OPTION_LIST_COPY.heart.markInterested).toBeDefined();
  });

  it("retains heart.removeInterest", () => {
    expect(OPTION_LIST_COPY.heart.removeInterest).toBeDefined();
  });

  it("retains interestCount", () => {
    expect(OPTION_LIST_COPY.interestCount).toBeDefined();
  });

  it("retains headerCaption", () => {
    expect(OPTION_LIST_COPY.headerCaption).toBeDefined();
  });
});
