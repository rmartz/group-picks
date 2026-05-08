import { NextResponse } from "next/server";
import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import { getVerifiedUid } from "@/server/utils/auth";
import { groupToFirebase } from "@/lib/firebase/schema/group";

export async function POST(request: Request) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { name: unknown };
  try {
    body = (await request.json()) as { name: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const name = body.name.trim();
  const db = getDatabase(getAdminApp());
  const groupRef = db.ref("groups").push();
  const groupId = groupRef.key;
  if (!groupId) {
    return NextResponse.json(
      { error: "Failed to generate group ID" },
      { status: 500 },
    );
  }

  const publicData = groupToFirebase({
    name,
    createdAt: new Date(),
    creatorId: uid,
    adminIds: [uid],
    picksRestricted: false,
  });

  await db.ref("/").update({
    [`groups/${groupId}`]: { public: publicData, members: { [uid]: true } },
    [`users/${uid}/groups/${groupId}`]: true,
  });

  return NextResponse.json({ groupId }, { status: 201 });
}
