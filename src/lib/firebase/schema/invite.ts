import { z } from "zod";

import { type GroupInvite, InviteMode } from "@/lib/types/invite";

export interface FirebaseGroupInvite {
  groupId: string;
  createdAt: number;
  expiresAt: number | null;
  active: boolean;
  mode?: InviteMode;
}

// Runtime shape of a persisted invite node, parsed on read. `mode` is left
// permissive (validated post-parse by isInviteMode) so an unknown mode value
// falls back to the default rather than throwing.
export const FirebaseGroupInviteSchema = z.object({
  groupId: z.string(),
  createdAt: z.number(),
  expiresAt: z.number().nullable(),
  active: z.boolean(),
  mode: z.unknown().optional(),
});

function isInviteMode(value: unknown): value is InviteMode {
  return (
    typeof value === "string" &&
    (Object.values(InviteMode) as string[]).includes(value)
  );
}

export function groupInviteToFirebase(
  invite: Pick<
    GroupInvite,
    "groupId" | "createdAt" | "expiresAt" | "active" | "mode"
  >,
): FirebaseGroupInvite {
  return {
    groupId: invite.groupId,
    createdAt: invite.createdAt.getTime(),
    expiresAt: invite.expiresAt?.getTime() ?? null,
    active: invite.active,
    mode: invite.mode,
  };
}

export function firebaseToGroupInvite(
  token: string,
  data: unknown,
): GroupInvite {
  const parsed = FirebaseGroupInviteSchema.parse(data);
  return {
    token,
    groupId: parsed.groupId,
    createdAt: new Date(parsed.createdAt),
    expiresAt:
      parsed.expiresAt !== null ? new Date(parsed.expiresAt) : undefined,
    active: parsed.active,
    mode: isInviteMode(parsed.mode) ? parsed.mode : InviteMode.Group,
  };
}
