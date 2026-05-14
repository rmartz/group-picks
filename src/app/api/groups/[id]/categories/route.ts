import { NextResponse } from "next/server";

import {
  createCategory,
  getCategoriesByGroupId,
} from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import { getVerifiedUid } from "@/server/utils/auth";

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

  const categories = await getCategoriesByGroupId(id);

  return NextResponse.json({
    categories: categories.map((c) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}

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

  let body: { name: unknown; description: unknown };
  try {
    body = (await request.json()) as { name: unknown; description: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const name = body.name.trim();
  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  const { id: categoryId, createdAt } = await createCategory({
    groupId: id,
    name,
    description,
    creatorId: uid,
  });

  return NextResponse.json(
    { categoryId, creatorId: uid, createdAt: createdAt.toISOString() },
    { status: 201 },
  );
}
