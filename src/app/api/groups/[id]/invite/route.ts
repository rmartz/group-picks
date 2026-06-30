import { NextResponse } from "next/server";

import { InviteMode } from "@/lib/types/invite";
import { getGroupById } from "@/server/data/groups";
import { createGroupInvite } from "@/server/data/invites";
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
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }

  const { mode } = body as Record<string, unknown>;
  if (mode !== InviteMode.Personal && mode !== InviteMode.Group) {
    return NextResponse.json(
      { error: "mode must be 'personal' or 'group'" },
      { status: 400 },
    );
  }

  const invite = await createGroupInvite(id, group.inviteToken, mode, uid);

  return NextResponse.json(
    {
      token: invite.token,
      expiresAt: invite.expiresAt.toISOString(),
      mode: invite.mode,
    },
    { status: 201 },
  );
}
