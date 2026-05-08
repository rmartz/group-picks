import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToPick,
  pickToFirebase,
  type FirebasePickPublic,
} from "@/lib/firebase/schema/pick";
import type { GroupPick } from "@/lib/types/pick";

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

export async function createPick(
  pick: Pick<GroupPick, "title" | "description" | "categoryId" | "creatorId">,
): Promise<{ id: string; createdAt: Date }> {
  const db = getDatabase(getAdminApp());
  const ref = db.ref(`categories/${pick.categoryId}/picks`).push();
  const id = ref.key;
  if (!id) throw new Error("Failed to generate pick ID");

  const createdAt = new Date();
  const pickData = pickToFirebase({
    ...pick,
    createdAt,
    topCount: 1,
    dueDate: undefined,
    closedAt: undefined,
    closedManually: undefined,
  });

  await ref.set(pickData);

  return { id, createdAt };
}

export async function updatePick(
  categoryId: string,
  pickId: string,
  updates: Pick<GroupPick, "title" | "description" | "topCount" | "dueDate">,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`categories/${categoryId}/picks/${pickId}`).update({
    title: updates.title,
    description: updates.description !== "" ? updates.description : null,
    topCount: updates.topCount,
    dueDate: updates.dueDate?.getTime() ?? null,
  });
}

export async function closePick(
  categoryId: string,
  pickId: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  const pickRef = db.ref(`categories/${categoryId}/picks/${pickId}`);

  await pickRef.transaction((current: FirebasePickPublic | null) => {
    if (current === null) return current;
    if (current.closedAt !== undefined) return current;
    return { ...current, closedAt: Date.now(), closedManually: true };
  });
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
