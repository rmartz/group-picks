import { describe, expect, it } from "vitest";

import {
  type FirebaseSnapPick,
  type FirebaseSnapPickActivation,
  firebaseToSnapPick,
  firebaseToSnapPickActivation,
  snapPickActivationToFirebase,
  snapPickToFirebase,
} from "./snap-pick";

const STARTED = new Date("2025-04-01T12:00:00.000Z");
const CLOSES = new Date("2025-04-01T12:05:00.000Z");
const CLOSED = new Date("2025-04-01T12:04:30.000Z");
const CREATED = new Date("2025-03-20T08:00:00.000Z");

function makeFirebaseSnapPick(
  overrides?: Partial<FirebaseSnapPick>,
): FirebaseSnapPick {
  return {
    title: "Lunch spot",
    categoryId: "cat-1",
    createdAt: CREATED.getTime(),
    creatorId: "user-1",
    defaultDurationMs: 300000,
    ...overrides,
  };
}

function makeFirebaseSnapPickActivation(
  overrides?: Partial<FirebaseSnapPickActivation>,
): FirebaseSnapPickActivation {
  return {
    snapPickId: "snap-1",
    startedAt: STARTED.getTime(),
    closesAt: CLOSES.getTime(),
    closedAt: CLOSED.getTime(),
    winnerId: "option-7",
    startedBy: "user-2",
    ...overrides,
  };
}

describe("snapPickToFirebase", () => {
  it("converts a SnapPick to Firebase format with epoch-ms createdAt", () => {
    const result = snapPickToFirebase({
      title: "Lunch spot",
      categoryId: "cat-1",
      createdAt: CREATED,
      creatorId: "user-1",
      defaultDurationMs: 300000,
    });

    expect(result.title).toBe("Lunch spot");
    expect(result.categoryId).toBe("cat-1");
    expect(result.createdAt).toBe(CREATED.getTime());
    expect(result.creatorId).toBe("user-1");
    expect(result.defaultDurationMs).toBe(300000);
  });
});

describe("firebaseToSnapPick", () => {
  it("converts Firebase data to a SnapPick with the id and a Date createdAt", () => {
    const result = firebaseToSnapPick("snap-9", makeFirebaseSnapPick());

    expect(result.id).toBe("snap-9");
    expect(result.title).toBe("Lunch spot");
    expect(result.categoryId).toBe("cat-1");
    expect(result.createdAt).toEqual(CREATED);
    expect(result.creatorId).toBe("user-1");
    expect(result.defaultDurationMs).toBe(300000);
  });

  it("round-trips a SnapPick through Firebase format", () => {
    const original = {
      title: "Movie night",
      categoryId: "cat-42",
      createdAt: CREATED,
      creatorId: "user-99",
      defaultDurationMs: 600000,
    };

    const result = firebaseToSnapPick("snap-2", snapPickToFirebase(original));

    expect(result.title).toBe(original.title);
    expect(result.categoryId).toBe(original.categoryId);
    expect(result.createdAt).toEqual(original.createdAt);
    expect(result.creatorId).toBe(original.creatorId);
    expect(result.defaultDurationMs).toBe(original.defaultDurationMs);
  });
});

describe("snapPickActivationToFirebase", () => {
  it("converts an activation to Firebase format with epoch-ms timestamps", () => {
    const result = snapPickActivationToFirebase({
      snapPickId: "snap-1",
      startedAt: STARTED,
      closesAt: CLOSES,
      closedAt: CLOSED,
      winnerId: "option-7",
      startedBy: "user-2",
    });

    expect(result.snapPickId).toBe("snap-1");
    expect(result.startedAt).toBe(STARTED.getTime());
    expect(result.closesAt).toBe(CLOSES.getTime());
    expect(result.closedAt).toBe(CLOSED.getTime());
    expect(result.winnerId).toBe("option-7");
    expect(result.startedBy).toBe("user-2");
  });

  it("omits closedAt and winnerId for a still-open activation", () => {
    const result = snapPickActivationToFirebase({
      snapPickId: "snap-1",
      startedAt: STARTED,
      closesAt: CLOSES,
      closedAt: undefined,
      winnerId: undefined,
      startedBy: "user-2",
    });

    expect(result.closedAt).toBeUndefined();
    expect(result.winnerId).toBeUndefined();
  });
});

describe("firebaseToSnapPickActivation", () => {
  it("converts Firebase data to an activation with the id and Date timestamps", () => {
    const result = firebaseToSnapPickActivation(
      "act-3",
      makeFirebaseSnapPickActivation(),
    );

    expect(result.id).toBe("act-3");
    expect(result.snapPickId).toBe("snap-1");
    expect(result.startedAt).toEqual(STARTED);
    expect(result.closesAt).toEqual(CLOSES);
    expect(result.closedAt).toEqual(CLOSED);
    expect(result.winnerId).toBe("option-7");
    expect(result.startedBy).toBe("user-2");
  });

  it("returns undefined closedAt and winnerId when absent (open activation)", () => {
    const result = firebaseToSnapPickActivation(
      "act-4",
      makeFirebaseSnapPickActivation({
        closedAt: undefined,
        winnerId: undefined,
      }),
    );

    expect(result.closedAt).toBeUndefined();
    expect(result.winnerId).toBeUndefined();
  });
});
