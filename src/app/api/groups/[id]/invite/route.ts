import { NextResponse } from "next/server";

import { getGroupById } from "@/server/data/groups";
import {
  createGroupInvite,
  updateGroupInviteExpiry,
} from "@/server/data/invites";
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

  const body = (await request.json()) as Record<string, unknown>;
  if (!("expiresAt" in body)) {
    return NextResponse.json({ error: "Missing expiresAt" }, { status: 400 });
  }

  const { expiresAt: rawExpiresAt } = body;

  let expiresAt: Date | null = null;
  if (rawExpiresAt !== null) {
    if (typeof rawExpiresAt !== "string") {
      return NextResponse.json({ error: "Invalid expiresAt" }, { status: 400 });
    }
    const parsed = new Date(rawExpiresAt);
    if (isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "Invalid expiresAt" }, { status: 400 });
    }
    if (parsed <= new Date()) {
      return NextResponse.json(
        { error: "expiresAt must be in the future" },
        { status: 400 },
      );
    }
    expiresAt = parsed;
  }

  await updateGroupInviteExpiry(group.inviteToken, expiresAt);

  return NextResponse.json({
    expiresAt: expiresAt !== null ? expiresAt.toISOString() : null,
  });
}
