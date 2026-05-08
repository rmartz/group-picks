import { NextResponse } from "next/server";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import { getCategoryById } from "@/server/data/categories";
import { getPickById, closePick } from "@/server/data/picks";

export async function POST(
  _request: Request,
  {
    params,
  }: { params: Promise<{ id: string; categoryId: string; pickId: string }> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, categoryId, pickId } = await params;
  const group = await getGroupById(id);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (!group.memberIds.includes(uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const category = await getCategoryById(categoryId);

  if (!category?.groupId || category.groupId !== id) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const pick = await getPickById(categoryId, pickId);

  if (!pick) {
    return NextResponse.json({ error: "Pick not found" }, { status: 404 });
  }

  if (pick.closedAt !== undefined) {
    return NextResponse.json(
      { error: "Pick is already closed" },
      { status: 409 },
    );
  }

  await closePick(categoryId, pickId);

  return NextResponse.json({ pickId });
}
