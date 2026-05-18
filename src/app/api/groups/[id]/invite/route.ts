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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const bodyRecord = body as Record<string, unknown>;
  if (!("expiresAt" in bodyRecord)) {
    return NextResponse.json({ error: "Missing expiresAt" }, { status: 400 });
  }

  const { expiresAt: rawExpiresAt } = bodyRecord;

  let expiresAt: Date | null = null;
  if (rawExpiresAt !== null) {
    if (
      typeof rawExpiresAt !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(rawExpiresAt) ||
      isNaN(new Date(rawExpiresAt).getTime()) ||
      new Date(rawExpiresAt).toISOString().slice(0, 10) !== rawExpiresAt
    ) {
      return NextResponse.json({ error: "Invalid expiresAt" }, { status: 400 });
    }
    expiresAt = new Date(`${rawExpiresAt}T23:59:59.999Z`);
    if (expiresAt <= new Date()) {
      return NextResponse.json(
        { error: "expiresAt must be in the future" },
        { status: 400 },
      );
    }
  }

  await updateGroupInviteExpiry(group.inviteToken, expiresAt);

  return NextResponse.json({
    expiresAt: expiresAt !== null ? expiresAt.toISOString() : null,
  });
}
