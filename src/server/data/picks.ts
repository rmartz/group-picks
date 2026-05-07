import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToPick,
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

  const data = snap.val() as FirebasePickPublic;
  return firebaseToPick(pickId, data);
}

export async function updatePick(
  categoryId: string,
  pickId: string,
  updates: Pick<GroupPick, "title" | "description" | "topCount" | "dueDate">,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`categories/${categoryId}/picks/${pickId}`).update({
    title: updates.title,
    description: updates.description,
    topCount: updates.topCount,
    dueDate: updates.dueDate?.getTime() ?? null,
  });
}
