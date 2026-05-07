import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToPick,
  type FirebasePickPublic,
} from "@/lib/firebase/schema/pick";
import type { GroupPick } from "@/lib/types/pick";

const PICK_CLOSED_ERROR = "Pick is closed and no longer accepts changes.";
const PICK_DUE_DATE_PASSED_ERROR =
  "Pick due date has passed. The pick has been closed and no longer accepts changes.";

export class PickWriteClosedError extends Error {
  readonly code = "pick_closed";

  constructor(message: string = PICK_CLOSED_ERROR) {
    super(message);
    this.name = "PickWriteClosedError";
  }
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
      if (currentData === null) return;
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
    throw new Error("Pick not found");
  }

  const pick = firebaseToPick(
    pickId,
    result.snapshot.val() as FirebasePickPublic,
  );
  const closedBecauseOverdue =
    pick.dueDate !== undefined &&
    pick.dueDate.getTime() <= nowTimestamp &&
    pick.closedAt?.getTime() === nowTimestamp;

  if (pick.closedAt !== undefined) {
    throw new PickWriteClosedError(
      closedBecauseOverdue ? PICK_DUE_DATE_PASSED_ERROR : PICK_CLOSED_ERROR,
    );
  }

  return pick;
}
