import { getDatabase, ServerValue } from "firebase-admin/database";
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

export async function toggleOptionInterest(
  categoryId: string,
  pickId: string,
  optionId: string,
  userId: string,
): Promise<boolean> {
  const db = getDatabase(getAdminApp());
  const interestRef = db.ref(
    `categories/${categoryId}/picks/${pickId}/interests/${userId}/${optionId}`,
  );
  const optionInterestedCountRef = db.ref(
    `categories/${categoryId}/picks/${pickId}/options/${optionId}/interestedCount`,
  );

  const result = await interestRef.transaction(
    (current: true | undefined | null) => {
      if (current) {
        return null; // remove
      }
      return true; // add
    },
  );

  const nowInterested = result.snapshot.exists();

  await optionInterestedCountRef.set(
    ServerValue.increment(nowInterested ? 1 : -1),
  );

  return nowInterested;
}
