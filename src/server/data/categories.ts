import { getDatabase } from "firebase-admin/database";

import { getAdminApp } from "@/lib/firebase/admin";
import {
  categoryToFirebase,
  type FirebaseCategoryPublic,
  firebaseToCategory,
} from "@/lib/firebase/schema/category";
import type { Category } from "@/lib/types/category";

export async function getCategoriesByGroupId(
  groupId: string,
): Promise<Category[]> {
  const db = getDatabase(getAdminApp());
  // Requires a Firebase Realtime Database index on "public/groupId" at the
  // "categories" path. Add to database rules:
  //   "categories": { ".indexOn": ["public/groupId"] }
  const snap = await db
    .ref(`categories`)
    .orderByChild("public/groupId")
    .equalTo(groupId)
    .get();

  if (!snap.exists()) return [];

  const categories: Category[] = [];
  snap.forEach((child) => {
    const id = child.key;
    if (!id) return;
    const publicData = (child.val() as { public: FirebaseCategoryPublic })
      .public;
    categories.push(firebaseToCategory(id, publicData));
  });

  return categories;
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

export async function categoryHasPicks(categoryId: string): Promise<boolean> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`categories/${categoryId}/picks`).get();
  return snap.exists();
}

export async function createCategory(
  category: Pick<Category, "groupId" | "name" | "description" | "creatorId">,
): Promise<{ id: string; createdAt: Date }> {
  const db = getDatabase(getAdminApp());
  const ref = db.ref("categories").push();
  const id = ref.key;
  if (!id) throw new Error("Failed to generate category ID");

  const createdAt = new Date();
  const publicData = categoryToFirebase({
    ...category,
    createdAt,
  });

  await db.ref(`categories/${id}`).set({ public: publicData });

  return { id, createdAt };
}

export async function updateCategory(
  id: string,
  updates: Pick<Category, "name" | "description">,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`categories/${id}/public`).update({
    name: updates.name,
    description: updates.description,
  });
}

export async function deleteCategory(categoryId: string): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db.ref(`categories/${categoryId}`).remove();
}
