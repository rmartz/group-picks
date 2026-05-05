import { NextResponse } from "next/server";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import {
  getCategoryById,
  categoryHasPicks,
  deleteCategory,
} from "@/server/data/categories";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; categoryId: string }> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId, categoryId } = await params;

  const group = await getGroupById(groupId);
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

  if (category.groupId !== groupId) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const hasPicks = await categoryHasPicks(categoryId);
  if (hasPicks) {
    return NextResponse.json(
      {
        error:
          "Cannot delete a category that has picks. Remove all picks first.",
      },
      { status: 409 },
    );
  }

  await deleteCategory(categoryId);
  return new NextResponse(null, { status: 204 });
}
