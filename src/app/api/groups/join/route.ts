import { NextResponse } from "next/server";
import { getVerifiedUid } from "@/server/utils/auth";
import {
  getGroupInviteByToken,
  addGroupMember,
} from "@/server/data/invites";

export async function POST(request: Request) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { token: unknown };
  try {
    body = (await request.json()) as { token: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.token !== "string" || !body.token.trim()) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  const token = body.token.trim();
  const invite = await getGroupInviteByToken(token);

  if (!invite) {
    return NextResponse.json(
      { error: "Invalid invite token" },
      { status: 404 },
    );
  }

  if (!invite.active) {
    return NextResponse.json(
      { error: "Invite link has been revoked" },
      { status: 410 },
    );
  }

  if (invite.expiresAt !== undefined && invite.expiresAt < new Date()) {
    return NextResponse.json(
      { error: "Invite link has expired" },
      { status: 410 },
    );
  }

  await addGroupMember(invite.groupId, uid);

  return NextResponse.json({ groupId: invite.groupId });
}
