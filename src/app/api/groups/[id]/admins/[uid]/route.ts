import { NextResponse } from "next/server";

import { getGroupById, revokeAdmin } from "@/server/data/groups";
import { getVerifiedUid } from "@/server/utils/auth";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; uid: string }> },
) {
  const callerId = await getVerifiedUid();
  if (!callerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, uid: targetUid } = await params;
  const group = await getGroupById(id);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (group.creatorId !== callerId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (targetUid === group.creatorId) {
    return NextResponse.json(
      { error: "Cannot demote the group creator" },
      { status: 403 },
    );
  }

  if (!group.adminIds.includes(targetUid)) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }

  await revokeAdmin(id, targetUid);

  return NextResponse.json({ uid: targetUid });
}
