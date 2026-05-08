import { NextResponse } from "next/server";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import { getCategoryById, updateCategory } from "@/server/data/categories";
import { getPicksByCategory } from "@/server/data/picks";

export async function PATCH(
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

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  if (category.groupId !== id) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  if (category.creatorId !== uid) {
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

  if (name !== category.name) {
    const picks = await getPicksByCategory(categoryId);
    const hasOtherMemberPicks = picks.some((pick) => pick.creatorId !== uid);
    if (hasOtherMemberPicks) {
      return NextResponse.json(
        { error: "Category name cannot be changed after others pick it" },
        { status: 409 },
      );
    }
  }

  await updateCategory(categoryId, { name, description });

  return NextResponse.json({ categoryId });
}
