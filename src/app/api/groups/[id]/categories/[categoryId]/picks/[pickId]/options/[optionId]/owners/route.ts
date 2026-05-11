import { NextResponse } from "next/server";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import { getCategoryById } from "@/server/data/categories";
import { getPickById, PICK_CLOSED_API_ERROR } from "@/server/data/picks";
import { joinOption, unjoinOption } from "@/server/data/options";

interface RouteParams {
  id: string;
  categoryId: string;
  pickId: string;
  optionId: string;
}

export async function POST(
  _request: Request,
  { params }: { params: Promise<RouteParams> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId, categoryId, pickId, optionId } = await params;
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

  const pick = await getPickById(categoryId, pickId);
  if (!pick) {
    return NextResponse.json({ error: "Pick not found" }, { status: 404 });
  }

  if (pick.closedAt !== undefined) {
    return NextResponse.json({ error: PICK_CLOSED_API_ERROR }, { status: 409 });
  }

  await joinOption(pickId, optionId, uid);
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<RouteParams> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId, categoryId, pickId, optionId } = await params;
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

  const pick = await getPickById(categoryId, pickId);
  if (!pick) {
    return NextResponse.json({ error: "Pick not found" }, { status: 404 });
  }

  if (pick.closedAt !== undefined) {
    return NextResponse.json({ error: PICK_CLOSED_API_ERROR }, { status: 409 });
  }

  const { deleted } = await unjoinOption(pickId, optionId, uid);
  return NextResponse.json({ ok: true, deleted }, { status: 200 });
}
