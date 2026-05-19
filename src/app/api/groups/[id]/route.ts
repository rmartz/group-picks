import { NextResponse } from "next/server";

import {
  getGroupById,
  removeMember,
  updatePicksRestricted,
} from "@/server/data/groups";
import { getVerifiedUid } from "@/server/utils/auth";
import { isGroupAdmin } from "@/server/utils/permissions";

export async function PATCH(
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

  if (!group.memberIds.includes(uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isGroupAdmin(uid, group)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { picksRestricted } = body as Record<string, unknown>;
  if (typeof picksRestricted !== "boolean") {
    return NextResponse.json(
      { error: "picksRestricted must be a boolean" },
      { status: 400 },
    );
  }

  await updatePicksRestricted(id, picksRestricted);

  return NextResponse.json({ picksRestricted });
}

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
