import { NextResponse } from "next/server";

import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import { getSnapPickById } from "@/server/data/snap-picks";

export async function authorizeSnapPickMember(
  uid: string,
  groupId: string,
  categoryId: string,
  snapPickId: string,
): Promise<NextResponse | undefined> {
  const [group, category, snapPick] = await Promise.all([
    getGroupById(groupId),
    getCategoryById(categoryId),
    getSnapPickById(categoryId, snapPickId),
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

  if (!snapPick) {
    return NextResponse.json({ error: "Snap pick not found" }, { status: 404 });
  }

  return undefined;
}
