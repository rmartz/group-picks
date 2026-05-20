import { randomUUID } from "crypto";
import { getDatabase } from "firebase-admin/database";
import { NextResponse } from "next/server";

import { getAdminApp } from "@/lib/firebase/admin";
import { groupToFirebase } from "@/lib/firebase/schema/group";
import { groupInviteToFirebase } from "@/lib/firebase/schema/invite";
import { InviteMode } from "@/lib/types/invite";
import { INVITE_TTL_GROUP } from "@/server/data/invites";
import { getVerifiedUid } from "@/server/utils/auth";

export async function POST(request: Request) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name: unknown; emoji: unknown };
  try {
    body = (await request.json()) as { name: unknown; emoji: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const name = body.name.trim();
  const emoji = typeof body.emoji === "string" ? body.emoji : "👥";
  const db = getDatabase(getAdminApp());
  const groupRef = db.ref("groups").push();
  const groupId = groupRef.key;
  if (!groupId) {
    return NextResponse.json(
      { error: "Failed to generate group ID" },
      { status: 500 },
    );
  }

  const inviteToken = randomUUID().replace(/-/g, "");
  const inviteCreatedAt = new Date();

  const publicData = groupToFirebase({
    name,
    emoji,
    createdAt: new Date(),
    creatorId: uid,
    inviteToken,
    adminIds: [uid],
    picksRestricted: false,
  });

  await db.ref().update({
    [`groups/${groupId}`]: {
      public: publicData,
      members: { [uid]: true },
    },
    [`users/${uid}/groups/${groupId}`]: true,
    [`invites/${inviteToken}`]: groupInviteToFirebase({
      groupId,
      createdAt: inviteCreatedAt,
      expiresAt: new Date(inviteCreatedAt.getTime() + INVITE_TTL_GROUP),
      active: true,
      mode: InviteMode.Group,
    }),
  });

  return NextResponse.json({ groupId }, { status: 201 });
}
