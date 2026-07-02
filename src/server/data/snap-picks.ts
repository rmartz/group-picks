import { getDatabase } from "firebase-admin/database";

import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToSnapPick,
  firebaseToSnapPickActivation,
  firebaseToSnapPickOption,
  snapPickOptionToFirebase,
  snapPickToFirebase,
} from "@/lib/firebase/schema/snap-pick";
import type {
  SnapPick,
  SnapPickActivation,
  SnapPickOption,
} from "@/lib/types/snap-pick";

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

export async function addSnapPickOption(
  snapPickId: string,
  option: Pick<SnapPickOption, "title" | "addedBy">,
): Promise<{ id: string; addedAt: Date }> {
  const db = getDatabase(getAdminApp());
  const ref = db.ref(`snap-pick-options/${snapPickId}`).push();
  const id = ref.key;
  if (!id) throw new Error("Failed to generate snap pick option ID");

  const addedAt = new Date();
  await ref.set(snapPickOptionToFirebase({ ...option, addedAt }));

  return { id, addedAt };
}

export async function removeSnapPickOption(
  snapPickId: string,
  optionId: string,
): Promise<{ removedAt: Date }> {
  const db = getDatabase(getAdminApp());
  const removedAt = new Date();
  await db
    .ref(`snap-pick-options/${snapPickId}/${optionId}/removedAt`)
    .set(removedAt.getTime());

  return { removedAt };
}

export async function getSnapPickOptions(
  snapPickId: string,
  includeRemoved = false,
): Promise<SnapPickOption[]> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`snap-pick-options/${snapPickId}`).get();

  if (!snap.exists()) return [];

  const data = snap.val() as Record<string, unknown>;
  const options = Object.entries(data).map(([id, optionData]) =>
    firebaseToSnapPickOption(id, optionData),
  );

  return includeRemoved
    ? options
    : options.filter((option) => option.removedAt === undefined);
}
