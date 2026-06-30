import { getDatabase } from "firebase-admin/database";

import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToSnapPick,
  firebaseToSnapPickActivation,
  snapPickToFirebase,
} from "@/lib/firebase/schema/snap-pick";
import type { SnapPick, SnapPickActivation } from "@/lib/types/snap-pick";

export async function createSnapPick(
  snapPick: Pick<
    SnapPick,
    "title" | "categoryId" | "creatorId" | "defaultDurationMs"
  >,
): Promise<{ id: string; createdAt: Date }> {
  const db = getDatabase(getAdminApp());
  const ref = db.ref(`snap-picks/${snapPick.categoryId}`).push();
  const id = ref.key;
  if (!id) throw new Error("Failed to generate snap pick ID");

  const createdAt = new Date();
  await ref.set(snapPickToFirebase({ ...snapPick, createdAt }));

  return { id, createdAt };
}

export async function getSnapPickById(
  categoryId: string,
  snapPickId: string,
): Promise<SnapPick | undefined> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`snap-picks/${categoryId}/${snapPickId}`).get();

  if (!snap.exists()) return undefined;

  return firebaseToSnapPick(snapPickId, snap.val());
}

export async function getSnapPicksByCategory(
  categoryId: string,
): Promise<SnapPick[]> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`snap-picks/${categoryId}`).get();

  if (!snap.exists()) return [];

  const data = snap.val() as Record<string, unknown>;
  return Object.entries(data).map(([id, snapPickData]) =>
    firebaseToSnapPick(id, snapPickData),
  );
}

export async function getSnapPickActivations(
  snapPickId: string,
): Promise<SnapPickActivation[]> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`snap-pick-activations/${snapPickId}`).get();

  if (!snap.exists()) return [];

  const data = snap.val() as Record<string, unknown>;
  return Object.entries(data).map(([id, activationData]) =>
    firebaseToSnapPickActivation(id, activationData),
  );
}
