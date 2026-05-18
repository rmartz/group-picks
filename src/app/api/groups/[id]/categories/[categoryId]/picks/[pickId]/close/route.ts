import { NextResponse } from "next/server";

import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import {
  assertPickIsOpenForWrite,
  closePick,
  PICK_CLOSED_API_ERROR,
  PickNotFoundError,
  PickWriteClosedError,
} from "@/server/data/picks";
import { getVerifiedUid } from "@/server/utils/auth";

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

  try {
    await assertPickIsOpenForWrite(categoryId, pickId);
  } catch (err) {
    if (err instanceof PickWriteClosedError) {
      return NextResponse.json(
        { error: PICK_CLOSED_API_ERROR },
        { status: 409 },
      );
    }
    if (err instanceof PickNotFoundError) {
      return NextResponse.json({ error: "Pick not found" }, { status: 404 });
    }
    throw err;
  }

  await closePick(categoryId, pickId);

  return NextResponse.json({ pickId });
}
