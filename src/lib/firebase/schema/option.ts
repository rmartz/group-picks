import { z } from "zod";

import type { Option } from "@/lib/types/option";

export interface FirebaseOption {
  title: string;
  ownerIds?: Record<string, true>;
  createdAt?: number;
}

// Runtime shape of a persisted option node, parsed on read.
const FirebaseOptionSchema = z.object({
  title: z.string(),
  ownerIds: z.record(z.string(), z.literal(true)).optional(),
  createdAt: z.number().optional(),
});

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
  data: unknown,
): Option {
  const parsed = FirebaseOptionSchema.parse(data);
  return {
    id,
    title: parsed.title,
    pickId,
    ownerIds: Object.keys(parsed.ownerIds ?? {}),
    createdAt:
      parsed.createdAt !== undefined
        ? new Date(parsed.createdAt).toISOString()
        : undefined,
  };
}
