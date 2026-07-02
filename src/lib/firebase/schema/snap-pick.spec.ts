import { describe, expect, it } from "vitest";

import {
  type FirebaseSnapPick,
  type FirebaseSnapPickActivation,
  type FirebaseSnapPickOption,
  firebaseToSnapPick,
  firebaseToSnapPickActivation,
  firebaseToSnapPickOption,
  firebaseToSnapPickVote,
  snapPickActivationToFirebase,
  snapPickOptionToFirebase,
  snapPickToFirebase,
  snapPickVoteToFirebase,
} from "./snap-pick";

const STARTED = new Date("2025-04-01T12:00:00.000Z");
const CLOSES = new Date("2025-04-01T12:05:00.000Z");
const CLOSED = new Date("2025-04-01T12:04:30.000Z");
const CREATED = new Date("2025-03-20T08:00:00.000Z");
const ADDED = new Date("2025-03-21T09:00:00.000Z");
const REMOVED = new Date("2025-03-22T10:00:00.000Z");

function makeFirebaseSnapPickOption(
  overrides?: Partial<FirebaseSnapPickOption>,
): FirebaseSnapPickOption {
  return {
    title: "Pizza",
    addedBy: "user-1",
    addedAt: ADDED.getTime(),
    ...overrides,
  };
}

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

describe("snapPickOptionToFirebase", () => {
  it("converts an option to Firebase format with epoch-ms addedAt", () => {
    const result = snapPickOptionToFirebase({
      title: "Pizza",
      addedBy: "user-1",
      addedAt: ADDED,
      removedAt: undefined,
    });

    expect(result.title).toBe("Pizza");
    expect(result.addedBy).toBe("user-1");
    expect(result.addedAt).toBe(ADDED.getTime());
    expect(result.removedAt).toBeUndefined();
  });

  it("serializes removedAt to epoch-ms for a soft-deleted option", () => {
    const result = snapPickOptionToFirebase({
      title: "Pizza",
      addedBy: "user-1",
      addedAt: ADDED,
      removedAt: REMOVED,
    });

    expect(result.removedAt).toBe(REMOVED.getTime());
  });
});

describe("firebaseToSnapPickOption", () => {
  it("converts Firebase data to an option with the id and a Date addedAt", () => {
    const result = firebaseToSnapPickOption(
      "option-9",
      makeFirebaseSnapPickOption(),
    );

    expect(result.id).toBe("option-9");
    expect(result.title).toBe("Pizza");
    expect(result.addedBy).toBe("user-1");
    expect(result.addedAt).toEqual(ADDED);
    expect(result.removedAt).toBeUndefined();
  });

  it("converts removedAt to a Date for a soft-deleted option", () => {
    const result = firebaseToSnapPickOption(
      "option-9",
      makeFirebaseSnapPickOption({ removedAt: REMOVED.getTime() }),
    );

    expect(result.removedAt).toEqual(REMOVED);
  });

  it("throws when a required field is missing", () => {
    expect(() =>
      firebaseToSnapPickOption("option-1", { title: "Orphan" }),
    ).toThrow();
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

describe("firebaseToSnapPick rejects malformed input", () => {
  it("throws when a required field is missing", () => {
    expect(() => firebaseToSnapPick("snap-1", { title: "Orphan" })).toThrow();
  });

  it("throws when a field has the wrong type", () => {
    const data = { ...makeFirebaseSnapPick(), createdAt: "not-a-number" };

    expect(() => firebaseToSnapPick("snap-1", data)).toThrow();
  });
});

describe("firebaseToSnapPickActivation rejects malformed input", () => {
  it("throws when a required field is missing", () => {
    expect(() =>
      firebaseToSnapPickActivation("act-1", { snapPickId: "snap-1" }),
    ).toThrow();
  });

  it("throws when a field has the wrong type", () => {
    const data = { ...makeFirebaseSnapPickActivation(), startedAt: "nope" };

    expect(() => firebaseToSnapPickActivation("act-1", data)).toThrow();
  });
});

describe("snapPickVoteToFirebase", () => {
  it("converts votedAt to epoch millis and preserves ids", () => {
    const result = snapPickVoteToFirebase({
      winnerId: "opt-a",
      loserId: "opt-b",
      votedBy: "user-1",
      votedAt: STARTED,
    });

    expect(result).toEqual({
      winnerId: "opt-a",
      loserId: "opt-b",
      votedBy: "user-1",
      votedAt: STARTED.getTime(),
    });
  });
});

describe("firebaseToSnapPickVote", () => {
  it("converts votedAt millis back to a Date and carries the id", () => {
    const result = firebaseToSnapPickVote("vote-9", {
      winnerId: "opt-a",
      loserId: "opt-b",
      votedBy: "user-1",
      votedAt: STARTED.getTime(),
    });

    expect(result.id).toBe("vote-9");
    expect(result.winnerId).toBe("opt-a");
    expect(result.votedAt).toEqual(STARTED);
  });

  it("throws when a required field is missing", () => {
    expect(() =>
      firebaseToSnapPickVote("vote-1", { winnerId: "opt-a" }),
    ).toThrow();
  });
});
