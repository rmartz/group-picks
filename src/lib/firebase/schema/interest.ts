import type { UserPickInterests } from "@/lib/types/option";

export type FirebaseInterests = Record<string, true>;

export function firebaseToInterests(
  pickId: string,
  categoryId: string,
  data: FirebaseInterests,
): UserPickInterests {
  return {
    pickId,
    categoryId,
    interestedOptionIds: Object.keys(data),
  };
}

export function interestsToFirebase(
  interestedOptionIds: string[],
): FirebaseInterests {
  const result: FirebaseInterests = {};
  for (const optionId of interestedOptionIds) {
    result[optionId] = true;
  }
  return result;
}
