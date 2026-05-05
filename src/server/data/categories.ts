import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import {
  categoryToFirebase,
  firebaseToCategory,
  type FirebaseCategoryPublic,
} from "@/lib/firebase/schema/category";
import type { Category } from "@/lib/types/category";

export async function getCategoriesByGroup(
  groupId: string,
): Promise<Category[]> {
  const db = getDatabase(getAdminApp());
  const snap = await db
    .ref("categories")
    .orderByChild("public/groupId")
    .equalTo(groupId)
    .get();

  if (!snap.exists()) return [];

  const results: Category[] = [];
  snap.forEach((child) => {
    const id = child.key;
    if (!id) return;
    const publicData = (child.val() as { public: FirebaseCategoryPublic })
      .public;
    results.push(firebaseToCategory(id, publicData));
  });

  return results;
}

export async function getCategoryById(
  categoryId: string,
): Promise<Category | undefined> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`categories/${categoryId}/public`).get();
  if (!snap.exists()) return undefined;
  return firebaseToCategory(categoryId, snap.val() as FirebaseCategoryPublic);
}

export async function categoryHasPicks(categoryId: string): Promise<boolean> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`categories/${categoryId}/picks`).get();
  return snap.exists();
}

export async function createCategory(
  groupId: string,
  name: string,
): Promise<string> {
  const db = getDatabase(getAdminApp());
  const ref = db.ref("categories").push();
  const categoryId = ref.key;
  if (!categoryId) throw new Error("Failed to generate category ID");

  const publicData = categoryToFirebase({
    groupId,
    name,
    createdAt: new Date(),
  });
  await db.ref(`categories/${categoryId}/public`).set(publicData);
  return categoryId;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`categories/${categoryId}`).remove();
}
