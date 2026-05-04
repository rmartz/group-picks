import { NextResponse } from "next/server";
import { getDatabase } from "firebase-admin/database";
import { getAdminApp } from "@/lib/firebase/admin";
import { getVerifiedUid } from "@/server/utils/auth";
import { categoryToFirebase } from "@/lib/firebase/schema/category";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId } = await params;
  const db = getDatabase(getAdminApp());

  const [groupSnap, memberSnap] = await Promise.all([
    db.ref(`groups/${groupId}/public`).get(),
    db.ref(`groups/${groupId}/members/${uid}`).get(),
  ]);

  if (!groupSnap.exists()) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (!memberSnap.exists()) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { name: unknown; description?: unknown };
  try {
    body = (await request.json()) as { name: unknown; description?: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const name = body.name.trim();
  const description =
    typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : undefined;

  const categoryRef = db.ref(`groups/${groupId}/categories`).push();
  const categoryId = categoryRef.key;
  if (!categoryId) {
    return NextResponse.json(
      { error: "Failed to generate category ID" },
      { status: 500 },
    );
  }

  const categoryData = categoryToFirebase({
    name,
    description,
    createdAt: new Date(),
    creatorId: uid,
  });

  await db
    .ref(`groups/${groupId}/categories/${categoryId}`)
    .set(categoryData);

  return NextResponse.json({ categoryId }, { status: 201 });
}
