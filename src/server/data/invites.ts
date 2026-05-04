import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import { getGroupById } from "./groups";
import type { Group } from "@/lib/types/group";

export async function getGroupByInviteToken(
  token: string,
): Promise<Group | undefined> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`invites/${token}`).get();
  if (!snap.exists()) return undefined;

  const groupId = snap.val() as string;
  return getGroupById(groupId);
}
