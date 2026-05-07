import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import {
  pickToFirebase,
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

export async function createPick(
  pick: Pick<
    GroupPick,
    "title" | "description" | "dueAt" | "topCount" | "categoryId" | "creatorId"
  >,
): Promise<{ id: string; createdAt: Date }> {
  const db = getDatabase(getAdminApp());
  const ref = db.ref(`categories/${pick.categoryId}/picks`).push();
  const id = ref.key;
  if (!id) throw new Error("Failed to generate pick ID");

  const createdAt = new Date();

  await ref.set(
    pickToFirebase({
      ...pick,
      createdAt,
    }),
  );

  return { id, createdAt };
}
