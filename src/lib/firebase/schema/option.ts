import type { Option } from "@/lib/types/option";

export interface FirebaseOption {
  title: string;
  ownerIds?: Record<string, true>;
  createdAt?: number;
}

export function optionToFirebase(
  option: Pick<Option, "title" | "ownerIds" | "createdAt">,
): FirebaseOption {
  return {
    title: option.title,
    ownerIds: Object.fromEntries(option.ownerIds.map((uid) => [uid, true])),
    createdAt:
      option.createdAt !== undefined
        ? new Date(option.createdAt).getTime()
        : undefined,
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
    createdAt:
      typeof data.createdAt === "number"
        ? new Date(data.createdAt).toISOString()
        : undefined,
  };
}
