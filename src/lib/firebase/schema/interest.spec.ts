import { describe, it, expect } from "vitest";
import {
  firebaseToInterests,
  interestsToFirebase,
  type FirebaseInterests,
} from "./interest";

describe("firebaseToInterests", () => {
  it("converts Firebase interests map to UserPickInterests", () => {
    const data: FirebaseInterests = {
      "opt-1": true,
      "opt-3": true,
    };

    const result = firebaseToInterests("pick-1", "cat-1", data);

    expect(result.pickId).toBe("pick-1");
    expect(result.categoryId).toBe("cat-1");
    expect(result.interestedOptionIds).toContain("opt-1");
    expect(result.interestedOptionIds).toContain("opt-3");
    expect(result.interestedOptionIds).toHaveLength(2);
  });

  it("returns empty interestedOptionIds for empty data", () => {
    const result = firebaseToInterests("pick-2", "cat-2", {});

    expect(result.interestedOptionIds).toEqual([]);
  });
});

describe("interestsToFirebase", () => {
  it("converts option id array to Firebase boolean map", () => {
    const result = interestsToFirebase(["opt-1", "opt-2"]);

    expect(result["opt-1"]).toBe(true);
    expect(result["opt-2"]).toBe(true);
  });

  it("returns empty object for empty array", () => {
    const result = interestsToFirebase([]);

    expect(result).toEqual({});
  });

  it("round-trips through Firebase format", () => {
    const ids = ["opt-a", "opt-b", "opt-c"];
    const firebase = interestsToFirebase(ids);
    const result = firebaseToInterests("pick-1", "cat-1", firebase);

    expect(result.interestedOptionIds).toHaveLength(3);
    for (const id of ids) {
      expect(result.interestedOptionIds).toContain(id);
    }
  });
});
