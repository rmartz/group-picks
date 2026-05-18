import { NextResponse } from "next/server";

import { getGroupById, promoteAdmin } from "@/server/data/groups";
import { getVerifiedUid } from "@/server/utils/auth";

export async function POST(
  request: Request,
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

  let body: { uid: unknown };
  try {
    body = (await request.json()) as { uid: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.uid !== "string" || !body.uid) {
    return NextResponse.json({ error: "uid is required" }, { status: 400 });
  }

  const targetUid = body.uid;

  if (!group.memberIds.includes(targetUid)) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  if (group.adminIds.includes(targetUid)) {
    return NextResponse.json(
      { error: "Member is already an admin" },
      { status: 409 },
    );
  }

  await promoteAdmin(id, targetUid);

  return NextResponse.json({ uid: targetUid });
}
