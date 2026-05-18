import { NextResponse } from "next/server";

import { getGroupById, removeGroupMember } from "@/server/data/groups";
import { getVerifiedUid } from "@/server/utils/auth";
import { isGroupAdmin } from "@/server/utils/permissions";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; uid: string }> },
) {
  const callerUid = await getVerifiedUid();
  if (!callerUid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, uid: targetUid } = await params;
  const group = await getGroupById(id);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (!isGroupAdmin(callerUid, group)) {
    return NextResponse.json(
      { error: "Only group admins can remove members" },
      { status: 403 },
    );
  }

  if (targetUid === callerUid) {
    return NextResponse.json(
      { error: "Use the leave group flow to remove yourself" },
      { status: 400 },
    );
  }

  if (targetUid === group.creatorId) {
    return NextResponse.json(
      { error: "The group creator cannot be removed" },
      { status: 400 },
    );
  }

  if (!group.memberIds.includes(targetUid)) {
    return NextResponse.json(
      { error: "User is not a member of this group" },
      { status: 404 },
    );
  }

  await removeGroupMember(id, targetUid);
  return new NextResponse(null, { status: 204 });
}
