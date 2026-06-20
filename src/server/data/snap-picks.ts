import { getDatabase } from "firebase-admin/database";

import { getAdminApp } from "@/lib/firebase/admin";
import {
  type FirebaseSnapPick,
  type FirebaseSnapPickActivation,
  firebaseToSnapPick,
  firebaseToSnapPickActivation,
} from "@/lib/firebase/schema/snap-pick";
import type { SnapPick, SnapPickActivation } from "@/lib/types/snap-pick";

export async function getSnapPickById(
  categoryId: string,
  snapPickId: string,
): Promise<SnapPick | undefined> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`snap-picks/${categoryId}/${snapPickId}`).get();

  if (!snap.exists()) return undefined;

  return firebaseToSnapPick(snapPickId, snap.val() as FirebaseSnapPick);
}

export async function getSnapPicksByCategory(
  categoryId: string,
): Promise<SnapPick[]> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`snap-picks/${categoryId}`).get();

  if (!snap.exists()) return [];

  const data = snap.val() as Record<string, FirebaseSnapPick>;
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

  const data = snap.val() as Record<string, FirebaseSnapPickActivation>;
  return Object.entries(data).map(([id, activationData]) =>
    firebaseToSnapPickActivation(id, activationData),
  );
}
