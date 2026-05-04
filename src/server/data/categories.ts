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
    .orderByChild("groupId")
    .equalTo(groupId)
    .get();

  if (!snap.exists()) return [];

  const categories: Category[] = [];
  snap.forEach((child) => {
    categories.push(
      firebaseToCategory(child.key, child.val() as FirebaseCategoryPublic),
    );
  });

  return categories;
}

export async function getCategoryById(
  categoryId: string,
): Promise<Category | undefined> {
  const db = getDatabase(getAdminApp());

  const snap = await db.ref(`categories/${categoryId}`).get();

  if (!snap.exists()) return undefined;

  return firebaseToCategory(categoryId, snap.val() as FirebaseCategoryPublic);
}
