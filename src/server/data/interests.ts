import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToInterests,
  type FirebaseInterests,
} from "@/lib/firebase/schema/interest";
import type { UserPickInterests } from "@/lib/types/option";

export async function getUserInterestsForPick(
  categoryId: string,
  pickId: string,
  userId: string,
): Promise<UserPickInterests> {
  const db = getDatabase(getAdminApp());
  const snap = await db
    .ref(`categories/${categoryId}/picks/${pickId}/interests/${userId}`)
    .get();

  if (!snap.exists()) {
    return { pickId, categoryId, interestedOptionIds: [] };
  }

  const data = snap.val() as FirebaseInterests;
  return firebaseToInterests(pickId, categoryId, data);
}

interface PickInterestData {
  interests?: Record<string, Record<string, true>>;
  options?: Record<string, { interestedCount?: number }>;
}

export async function toggleOptionInterest(
  categoryId: string,
  pickId: string,
  optionId: string,
  userId: string,
): Promise<boolean> {
  const db = getDatabase(getAdminApp());
  const pickRef = db.ref(`categories/${categoryId}/picks/${pickId}`);

  let nowInterested = false;

  await pickRef.transaction((current: PickInterestData | null) => {
    if (current === null) return current;

    const wasInterested = current.interests?.[userId]?.[optionId] === true;
    nowInterested = !wasInterested;

    const existingUserInterests = current.interests?.[userId] ?? {};
    const withoutOption = Object.fromEntries(
      Object.entries(existingUserInterests).filter(([k]) => k !== optionId),
    ) as Record<string, true>;
    const userInterests: Record<string, true> = wasInterested
      ? withoutOption
      : { ...existingUserInterests, [optionId]: true };

    const currentCount = current.options?.[optionId]?.interestedCount ?? 0;

    return {
      ...current,
      interests: {
        ...(current.interests ?? {}),
        [userId]: userInterests,
      },
      options: {
        ...(current.options ?? {}),
        [optionId]: {
          ...(current.options?.[optionId] ?? {}),
          interestedCount: currentCount + (wasInterested ? -1 : 1),
        },
      },
    };
  });

  return nowInterested;
}
