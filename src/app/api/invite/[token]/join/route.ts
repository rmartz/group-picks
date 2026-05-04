import { NextResponse } from "next/server";
import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupByInviteToken } from "@/server/data/invites";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;
  const group = await getGroupByInviteToken(token);
  if (!group) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (group.memberIds.includes(uid)) {
    return NextResponse.json({ groupId: group.id });
  }

  const db = getDatabase(getAdminApp());
  await db.ref(`groups/${group.id}/members/${uid}`).set(true);

  return NextResponse.json({ groupId: group.id });
}
