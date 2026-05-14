import { NextResponse } from "next/server";

import { getGroupById } from "@/server/data/groups";
import { createGroupInvite } from "@/server/data/invites";
import { getVerifiedUid } from "@/server/utils/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const group = await getGroupById(id);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (!group.memberIds.includes(uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invite = await createGroupInvite(id, group.inviteToken);

  return NextResponse.json(
    { token: invite.token, expiresAt: invite.expiresAt.toISOString() },
    { status: 201 },
  );
}
