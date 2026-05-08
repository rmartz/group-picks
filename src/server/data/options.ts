import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToOption,
  optionToFirebase,
  type FirebaseOption,
} from "@/lib/firebase/schema/option";
import type { Option } from "@/lib/types/option";

export async function getOptionsByPick(pickId: string): Promise<Option[]> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`picks/${pickId}/options`).get();

  if (!snap.exists()) return [];

  const data = snap.val() as Record<string, FirebaseOption>;
  return Object.entries(data).map(([id, optionData]) =>
    firebaseToOption(id, pickId, optionData),
  );
}

export async function addOption(
  pickId: string,
  title: string,
  ownerUid: string,
): Promise<{ id: string }> {
  const db = getDatabase(getAdminApp());
  const ref = db.ref(`picks/${pickId}/options`).push();
  const id = ref.key;
  if (!id) throw new Error("Failed to generate option ID");

  await ref.set(optionToFirebase({ title, ownerIds: [ownerUid] }));

  return { id };
}

export async function joinOption(
  pickId: string,
  optionId: string,
  ownerUid: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db
    .ref(`picks/${pickId}/options/${optionId}/ownerIds/${ownerUid}`)
    .set(true);
}

export async function getOptionsByCategory(
  pickIds: string[],
): Promise<Option[]> {
  if (pickIds.length === 0) return [];

  const db = getDatabase(getAdminApp());
  const snapshots = await Promise.all(
    pickIds.map((pickId) => db.ref(`picks/${pickId}/options`).get()),
  );

  const options: Option[] = [];
  for (const [i, snap] of snapshots.entries()) {
    const pickId = pickIds[i];
    if (!snap.exists() || !pickId) continue;
    const data = snap.val() as Record<string, FirebaseOption>;
    for (const [id, optionData] of Object.entries(data)) {
      options.push(firebaseToOption(id, pickId, optionData));
    }
  }

  return options;
}
