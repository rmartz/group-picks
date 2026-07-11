import { describe, expect, it } from "vitest";

import {
  firebaseToSnapPickPreferences,
  firebaseToSnapPickRating,
  snapPickRatingToFirebase,
} from "./snap-pick-preference";

describe("snapPickRatingToFirebase", () => {
  it("serializes a rating to its persisted shape", () => {
    expect(snapPickRatingToFirebase({ rating: 1016, games: 3 })).toEqual({
      rating: 1016,
      games: 3,
    });
  });
});

describe("firebaseToSnapPickRating", () => {
  it("parses a single persisted rating node", () => {
    expect(firebaseToSnapPickRating({ rating: 984, games: 5 })).toEqual({
      rating: 984,
      games: 5,
    });
  });

  it("throws on a malformed node missing games", () => {
    expect(() => firebaseToSnapPickRating({ rating: 984 })).toThrow();
  });
});

describe("firebaseToSnapPickPreferences", () => {
  it("parses a user's whole rating vector keyed by option", () => {
    const parsed = firebaseToSnapPickPreferences({
      "opt-a": { rating: 1200, games: 4 },
      "opt-b": { rating: 900, games: 4 },
    });

    expect(parsed).toEqual({
      "opt-a": { rating: 1200, games: 4 },
      "opt-b": { rating: 900, games: 4 },
    });
  });

  it("throws when an option's rating is not a number", () => {
    expect(() =>
      firebaseToSnapPickPreferences({ "opt-a": { rating: "high", games: 4 } }),
    ).toThrow();
  });
});
