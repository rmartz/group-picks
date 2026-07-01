import { NextResponse } from "next/server";

import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import {
  getSnapPickById,
  getSnapPickOptions,
  removeSnapPickOption,
} from "@/server/data/snap-picks";
import { getVerifiedUid } from "@/server/utils/auth";

interface RouteParams {
  params: Promise<{
    id: string;
    categoryId: string;
    snapPickId: string;
    optionId: string;
  }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId, categoryId, snapPickId, optionId } = await params;
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

  const options = await getSnapPickOptions(snapPickId, true);
  const option = options.find((o) => o.id === optionId);

  if (!option || option.removedAt !== undefined) {
    return NextResponse.json({ error: "Option not found" }, { status: 404 });
  }

  // Only the member who added an option may remove it from the pool.
  if (option.addedBy !== uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { removedAt } = await removeSnapPickOption(snapPickId, optionId);

  return NextResponse.json({ removedAt: removedAt.toISOString() });
}
