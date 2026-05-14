import { NextResponse } from "next/server";

import { getGroupById, removeMember } from "@/server/data/groups";
import { getVerifiedUid } from "@/server/utils/auth";

export async function GET(
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

  return NextResponse.json({
    group: { ...group, createdAt: group.createdAt.toISOString() },
  });
}

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

  if (!group.memberIds.includes(uid)) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  const { lastMember } = await removeMember(id, uid);
  if (lastMember) {
    return NextResponse.json(
      { error: "Cannot leave as last member" },
      { status: 409 },
    );
  }

  return new NextResponse(null, { status: 204 });
}
