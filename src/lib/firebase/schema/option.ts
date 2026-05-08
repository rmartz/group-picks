import type { Option } from "@/lib/types/option";

export interface FirebaseOption {
  title: string;
  ownerIds?: Record<string, true>;
}

export function optionToFirebase(
  option: Pick<Option, "title" | "ownerIds">,
): FirebaseOption {
  return {
    title: option.title,
    ownerIds: Object.fromEntries(option.ownerIds.map((uid) => [uid, true])),
  };
}

export function firebaseToOption(
  id: string,
  pickId: string,
  data: FirebaseOption,
): Option {
  return {
    id,
    title: data.title,
    pickId,
    ownerIds: Object.keys(data.ownerIds ?? {}),
  };
}
