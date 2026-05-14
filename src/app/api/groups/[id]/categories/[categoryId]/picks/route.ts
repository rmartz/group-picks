import { NextResponse } from "next/server";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import { getCategoryById } from "@/server/data/categories";
import { createPick, getPicksByCategory } from "@/server/data/picks";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; categoryId: string }> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId, categoryId } = await params;
  const [group, category] = await Promise.all([
    getGroupById(groupId),
    getCategoryById(categoryId),
  ]);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (!group.memberIds.includes(uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (category?.groupId !== groupId) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const picks = await getPicksByCategory(categoryId);

  return NextResponse.json({
    picks: picks.map((p) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; categoryId: string }> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId, categoryId } = await params;
  const [group, category] = await Promise.all([
    getGroupById(groupId),
    getCategoryById(categoryId),
  ]);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (!group.memberIds.includes(uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (category?.groupId !== groupId) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  let body: {
    title: unknown;
    description: unknown;
    topCount: unknown;
    dueDate: unknown;
  };
  try {
    body = (await request.json()) as {
      title: unknown;
      description: unknown;
      topCount: unknown;
      dueDate: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const title = body.title.trim();
  const description =
    typeof body.description === "string" ? body.description.trim() : undefined;
  if (
    body.topCount !== undefined &&
    (typeof body.topCount !== "number" ||
      !Number.isInteger(body.topCount) ||
      body.topCount < 1)
  ) {
    return NextResponse.json(
      { error: "topCount must be a positive integer" },
      { status: 400 },
    );
  }
  const topCount = typeof body.topCount === "number" ? body.topCount : 1;

  let dueDate: Date | undefined;
  if (typeof body.dueDate === "string" && body.dueDate) {
    const parts = body.dueDate.split("-").map(Number);
    if (
      parts.length !== 3 ||
      parts.some((p) => Number.isNaN(p)) ||
      parts[0] === undefined ||
      parts[1] === undefined ||
      parts[2] === undefined
    ) {
      return NextResponse.json(
        { error: "dueDate is invalid" },
        { status: 400 },
      );
    }
    dueDate = new Date(parts[0], parts[1] - 1, parts[2]);
    if (Number.isNaN(dueDate.getTime())) {
      return NextResponse.json(
        { error: "dueDate is invalid" },
        { status: 400 },
      );
    }
  }

  const { id: pickId, createdAt } = await createPick({
    title,
    description,
    categoryId,
    creatorId: uid,
    topCount,
    dueDate,
  });

  return NextResponse.json(
    { pickId, creatorId: uid, createdAt: createdAt.toISOString() },
    { status: 201 },
  );
}
