import { NextResponse } from "next/server";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupInviteByToken, addGroupMember } from "@/server/data/invites";
import { getGroupById } from "@/server/data/groups";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await params;
  const invite = await getGroupInviteByToken(token);
  if (!invite?.active) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  const group = await getGroupById(invite.groupId);
  if (!group) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  if (group.memberIds.includes(uid)) {
    return NextResponse.json({ groupId: group.id });
  }

  await addGroupMember(group.id, uid);

  return NextResponse.json({ groupId: group.id });
}
