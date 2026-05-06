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
