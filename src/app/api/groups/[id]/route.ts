import { NextResponse } from "next/server";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById, removeMember } from "@/server/data/groups";

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

  if (!group?.memberIds.includes(uid)) {
    return NextResponse.json({ error: "Not a member" }, { status: 403 });
  }

  if (group.memberIds.length === 1) {
    return NextResponse.json(
      { error: "Cannot leave as last member" },
      { status: 409 },
    );
  }

  await removeMember(id, uid);
  return new NextResponse(null, { status: 204 });
}
