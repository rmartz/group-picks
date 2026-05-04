import { NextResponse } from "next/server";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import {
  getOrCreateGroupInvite,
  setGroupInviteExpiry,
} from "@/server/data/invites";

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

  if (!group.memberIds.includes(uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invite = await getOrCreateGroupInvite(id);

  return NextResponse.json({
    token: invite.token,
    expiresAt: invite.expiresAt?.toISOString() ?? null,
  });
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

  let body: { expiresAt: unknown };
  try {
    body = (await request.json()) as { expiresAt: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (body.expiresAt !== null && typeof body.expiresAt !== "string") {
    return NextResponse.json(
      { error: "expiresAt must be an ISO date string or null" },
      { status: 400 },
    );
  }

  let expiresAt: Date | undefined;
  if (body.expiresAt !== null) {
    const parsed = new Date(body.expiresAt);
    if (isNaN(parsed.getTime())) {
      return NextResponse.json(
        { error: "expiresAt is not a valid date" },
        { status: 400 },
      );
    }
    expiresAt = parsed;
  }

  const invite = await getOrCreateGroupInvite(id);
  await setGroupInviteExpiry(id, expiresAt);

  return NextResponse.json({
    token: invite.token,
    expiresAt: expiresAt?.toISOString() ?? null,
  });
}
