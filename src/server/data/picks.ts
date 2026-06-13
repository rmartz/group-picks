import { getDatabase } from "firebase-admin/database";

import { getAdminApp } from "@/lib/firebase/admin";
import {
  type FirebasePickPublic,
  firebaseToPick,
  pickToFirebase,
} from "@/lib/firebase/schema/pick";
import type { GroupPick, RankingMode } from "@/lib/types/pick";

export const PICK_CLOSED_API_ERROR = "Pick is closed";
const PICK_CLOSED_ERROR = "Pick is closed and no longer accepts changes.";
const PICK_DUE_DATE_PASSED_ERROR =
  "Pick due date has passed. The pick has been closed and no longer accepts changes.";

export class PickNotFoundError extends Error {
  readonly code = "pick_not_found";

  constructor() {
    super("Pick not found");
    this.name = "PickNotFoundError";
  }
}

export class PickWriteClosedError extends Error {
  readonly code = "pick_closed";

  constructor(message: string = PICK_CLOSED_ERROR) {
    super(message);
    this.name = "PickWriteClosedError";
  }
}

export async function hasPicks(categoryId: string): Promise<boolean> {
  const db = getDatabase(getAdminApp());
  const snap = await db
    .ref(`categories/${categoryId}/picks`)
    .limitToFirst(1)
    .get();
  return snap.exists();
}

export async function getPicksByCategory(
  categoryId: string,
): Promise<GroupPick[]> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`categories/${categoryId}/picks`).get();

  if (!snap.exists()) return [];

  const data = snap.val() as Record<string, FirebasePickPublic>;
  return Object.entries(data).map(([id, pickData]) =>
    firebaseToPick(id, pickData),
  );
}

export async function getPicksByCategoryIds(
  categoryIds: string[],
): Promise<Record<string, GroupPick[]>> {
  const pickArrays = await Promise.all(
    categoryIds.map((id) => getPicksByCategory(id)),
  );

  return Object.fromEntries(
    categoryIds.map((id, i) => [id, pickArrays[i] ?? []]),
  );
}

export async function getPickById(
  categoryId: string,
  pickId: string,
): Promise<GroupPick | undefined> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`categories/${categoryId}/picks/${pickId}`).get();

  if (!snap.exists()) return undefined;

  return firebaseToPick(pickId, snap.val() as FirebasePickPublic);
}

export async function assertPickIsOpenForWrite(
  categoryId: string,
  pickId: string,
  now: Date = new Date(),
): Promise<GroupPick> {
  const db = getDatabase(getAdminApp());
  const pickRef = db.ref(`categories/${categoryId}/picks/${pickId}`);
  const nowTimestamp = now.getTime();

  const result = await pickRef.transaction(
    (currentData: FirebasePickPublic | null) => {
      if (currentData === null) return undefined;
      if (currentData.closedAt !== undefined) return currentData;
      if (
        currentData.dueDate === undefined ||
        currentData.dueDate > nowTimestamp
      ) {
        return currentData;
      }

      return { ...currentData, closedAt: nowTimestamp };
    },
  );

  if (!result.snapshot.exists()) {
    throw new PickNotFoundError();
  }

  const pick = firebaseToPick(
    pickId,
    result.snapshot.val() as FirebasePickPublic,
  );

  if (pick.closedAt !== undefined) {
    throw new PickWriteClosedError(
      pick.closedAt.getTime() === nowTimestamp
        ? PICK_DUE_DATE_PASSED_ERROR
        : PICK_CLOSED_ERROR,
    );
  }

  return pick;
}

export async function createPick(
  pick: Pick<GroupPick, "title" | "categoryId" | "creatorId" | "topCount"> & {
    description?: string;
    dueDate?: Date;
    rankingMode?: RankingMode;
  },
): Promise<{ id: string; createdAt: Date }> {
  const db = getDatabase(getAdminApp());
  const ref = db.ref(`categories/${pick.categoryId}/picks`).push();
  const id = ref.key;
  if (!id) throw new Error("Failed to generate pick ID");

  const createdAt = new Date();
  const pickData = pickToFirebase({
    ...pick,
    createdAt,
    closedAt: undefined,
    closedManually: undefined,
  });

  await ref.set(pickData);

  return { id, createdAt };
}

export async function updatePickIfOpen(
  categoryId: string,
  pickId: string,
  updates: Pick<GroupPick, "title" | "description" | "topCount" | "dueDate">,
  now: Date = new Date(),
): Promise<void> {
  const db = getDatabase(getAdminApp());
  const pickRef = db.ref(`categories/${categoryId}/picks/${pickId}`);
  const nowTimestamp = now.getTime();

  const result = await pickRef.transaction(
    (currentData: FirebasePickPublic | null) => {
      if (currentData === null) return undefined;
      if (currentData.closedAt !== undefined) return currentData;
      if (
        currentData.dueDate !== undefined &&
        currentData.dueDate <= nowTimestamp
      ) {
        return { ...currentData, closedAt: nowTimestamp };
      }

      const next: FirebasePickPublic = {
        ...currentData,
        title: updates.title,
        topCount: updates.topCount,
      };

      if (updates.description !== "") {
        next.description = updates.description;
      } else {
        delete next.description;
      }

      if (updates.dueDate !== undefined) {
        next.dueDate = updates.dueDate.getTime();
      } else {
        delete next.dueDate;
      }

      return next;
    },
  );

  if (!result.snapshot.exists()) {
    throw new PickNotFoundError();
  }

  const pick = firebaseToPick(
    pickId,
    result.snapshot.val() as FirebasePickPublic,
  );

  if (pick.closedAt !== undefined) {
    throw new PickWriteClosedError(
      pick.closedAt.getTime() === nowTimestamp
        ? PICK_DUE_DATE_PASSED_ERROR
        : PICK_CLOSED_ERROR,
    );
  }
}

export async function closePick(
  categoryId: string,
  pickId: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  const pickRef = db.ref(`categories/${categoryId}/picks/${pickId}`);
  const now = Date.now();

  const result = await pickRef.transaction(
    (current: FirebasePickPublic | null) => {
      if (current === null) return undefined;
      if (current.closedAt !== undefined) return undefined;
      if (current.dueDate !== undefined && current.dueDate <= now) {
        return { ...current, closedAt: now };
      }
      return { ...current, closedAt: now, closedManually: true };
    },
  );

  if (!result.snapshot.exists()) {
    throw new PickNotFoundError();
  }

  if (!result.committed) {
    throw new PickWriteClosedError();
  }
}

export async function reopenPick(
  categoryId: string,
  pickId: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`categories/${categoryId}/picks/${pickId}`).update({
    closedAt: null,
    closedManually: null,
  });
}
