import { NextResponse } from "next/server";

import { deleteGroup, getGroupById } from "@/server/data/groups";
import { getVerifiedUid } from "@/server/utils/auth";

export async function DELETE(
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

  if (group.creatorId !== uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await deleteGroup(id, group.memberIds, group.inviteToken);

  return new NextResponse(null, { status: 204 });
}
