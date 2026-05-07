import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import {
  optionToFirebase,
  firebaseToOption,
  type FirebaseOptionPublic,
} from "@/lib/firebase/schema/option";
import type { PickOption } from "@/lib/types/option";

export async function getOptionsByPick(
  categoryId: string,
  pickId: string,
): Promise<PickOption[]> {
  const db = getDatabase(getAdminApp());
  const snap = await db
    .ref(`categories/${categoryId}/picks/${pickId}/options`)
    .get();

  if (!snap.exists()) return [];

  const options: PickOption[] = [];
  snap.forEach((child) => {
    const id = child.key;
    if (!id) return;
    const data = child.val() as FirebaseOptionPublic;
    options.push(firebaseToOption(id, categoryId, pickId, data));
  });

  return options;
}

export async function createOption(
  categoryId: string,
  pickId: string,
  option: { name: string; creatorId: string },
): Promise<{ id: string; createdAt: Date }> {
  const db = getDatabase(getAdminApp());
  const ref = db.ref(`categories/${categoryId}/picks/${pickId}/options`).push();
  const id = ref.key;
  if (!id) throw new Error("Failed to generate option ID");

  const createdAt = new Date();
  const data = optionToFirebase({
    name: option.name,
    creatorId: option.creatorId,
    owners: [option.creatorId],
    createdAt,
  });

  await ref.set(data);

  return { id, createdAt };
}
