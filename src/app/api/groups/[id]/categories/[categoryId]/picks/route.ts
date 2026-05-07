import { NextResponse } from "next/server";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import { getCategoryById } from "@/server/data/categories";
import { createPick } from "@/server/data/picks";

interface CreatePickRequestBody {
  name: unknown;
  description: unknown;
  dueDate: unknown;
  topCount: unknown;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; categoryId: string }> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, categoryId } = await params;
  const group = await getGroupById(id);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (!group.memberIds.includes(uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const category = await getCategoryById(categoryId);

  if (category?.groupId !== id) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  let body: CreatePickRequestBody;
  try {
    body = (await request.json()) as CreatePickRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  if (typeof body.topCount !== "number" || !Number.isInteger(body.topCount)) {
    return NextResponse.json(
      { error: "topCount must be an integer" },
      { status: 400 },
    );
  }

  if (body.topCount < 1) {
    return NextResponse.json(
      { error: "topCount must be greater than 0" },
      { status: 400 },
    );
  }

  const dueAt =
    typeof body.dueDate === "string" && body.dueDate
      ? new Date(body.dueDate)
      : undefined;
  if (dueAt && Number.isNaN(dueAt.getTime())) {
    return NextResponse.json({ error: "dueDate is invalid" }, { status: 400 });
  }

  const description =
    typeof body.description === "string" ? body.description.trim() : "";

  const { id: pickId, createdAt } = await createPick({
    title: body.name.trim(),
    description,
    dueAt,
    topCount: body.topCount,
    categoryId,
    creatorId: uid,
  });

  return NextResponse.json(
    { pickId, creatorId: uid, createdAt: createdAt.toISOString() },
    { status: 201 },
  );
}
