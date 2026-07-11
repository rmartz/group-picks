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

// A Snap Pick together with one of its currently-running activations. Surfaced
// on the group activity view so members can jump straight into an open vote.
export interface ActiveSnapPickActivation {
  snapPick: SnapPick;
  activation: SnapPickActivation;
}

// An activation is "active" when it has not been explicitly closed and its
// scheduled close time is still in the future.
function isActivationActive(
  activation: SnapPickActivation,
  now: Date,
): boolean {
  return (
    activation.closedAt === undefined &&
    activation.closesAt.getTime() > now.getTime()
  );
}

export async function getActiveSnapPickActivationsByCategories(
  categoryIds: string[],
  now: Date = new Date(),
): Promise<ActiveSnapPickActivation[]> {
  const snapPickArrays = await Promise.all(
    categoryIds.map((categoryId) => getSnapPicksByCategory(categoryId)),
  );
  const snapPicks = snapPickArrays.flat();

  const activationArrays = await Promise.all(
    snapPicks.map((snapPick) => getSnapPickActivations(snapPick.id)),
  );

  return snapPicks.flatMap((snapPick, i) =>
    (activationArrays[i] ?? [])
      .filter((activation) => isActivationActive(activation, now))
      .map((activation) => ({ snapPick, activation })),
  );
}

// Past runs of this snap pick, newest first — the source of the history
// timeline. An activation is "closed" once it has a closedAt; open runs are
// excluded. Sorted by closedAt descending so the most recent pick is first.
export async function getClosedActivations(
  snapPickId: string,
): Promise<SnapPickActivation[]> {
  const activations = await getSnapPickActivations(snapPickId);
  return activations
    .filter((activation) => activation.closedAt !== undefined)
    .sort(
      (a, b) => (b.closedAt?.getTime() ?? 0) - (a.closedAt?.getTime() ?? 0),
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

export async function getSnapPickOptionById(
  snapPickId: string,
  optionId: string,
): Promise<SnapPickOption | undefined> {
  const db = getDatabase(getAdminApp());
  const snap = await db
    .ref(`snap-pick-options/${snapPickId}/${optionId}`)
    .get();

  if (!snap.exists()) return undefined;

  return firebaseToSnapPickOption(optionId, snap.val());
}
