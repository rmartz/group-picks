import { type FirebasePickPublic } from "../pick";

export const FIXED_DATE = new Date("2025-01-15T12:00:00.000Z");
export const FIXED_TIMESTAMP = FIXED_DATE.getTime();
export const FIXED_DUE_DATE = new Date("2025-02-01T09:30:00.000Z");

export const CLOSED_DATE = new Date("2025-02-01T09:00:00.000Z");
export const CLOSED_TIMESTAMP = CLOSED_DATE.getTime();

export function makeFirebasePickPublic(
  overrides?: Partial<FirebasePickPublic>,
): FirebasePickPublic {
  return {
    title: "The Shawshank Redemption",
    description: "A classic film about hope",
    topCount: 3,
    dueDate: FIXED_DUE_DATE.getTime(),
    categoryId: "cat-123",
    createdAt: FIXED_TIMESTAMP,
    creatorId: "user-123",
    ...overrides,
  };
}
