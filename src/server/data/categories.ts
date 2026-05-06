import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToCategory,
  type FirebaseCategoryPublic,
} from "@/lib/firebase/schema/category";
import type { Category } from "@/lib/types/category";

export async function getCategoriesByGroupId(
  groupId: string,
): Promise<Category[]> {
  const db = getDatabase(getAdminApp());

  const snap = await db
    .ref("categories")
    .orderByChild("public/groupId")
    .equalTo(groupId)
    .get();

  if (!snap.exists()) return [];

  return Object.entries(
    snap.val() as Record<string, { public: FirebaseCategoryPublic }>,
  ).map(([id, data]) => firebaseToCategory(id, data.public));
}

export async function getCategoryById(
  id: string,
): Promise<Category | undefined> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`categories/${id}/public`).get();

  if (!snap.exists()) return undefined;

  const data = snap.val() as FirebaseCategoryPublic;
  return firebaseToCategory(id, data);
}
