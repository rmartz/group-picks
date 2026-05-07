import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToPick,
  type FirebasePickPublic,
} from "@/lib/firebase/schema/pick";
import { PickStatus, type GroupPick } from "@/lib/types/pick";

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

export async function closePick(
  categoryId: string,
  pickId: string,
): Promise<boolean> {
  const db = getDatabase(getAdminApp());
  const pickRef = db.ref(`categories/${categoryId}/picks/${pickId}`);
  const snap = await pickRef.get();

  if (!snap.exists()) return false;

  const pick = snap.val() as FirebasePickPublic;
  if ((pick.status ?? PickStatus.Open) === PickStatus.Closed) return true;

  await pickRef.update({
    closedAt: Date.now(),
    status: PickStatus.Closed,
  });

  return true;
}
