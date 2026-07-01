import { NextResponse } from "next/server";

import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import {
  addSnapPickOption,
  getSnapPickById,
  getSnapPickOptions,
} from "@/server/data/snap-picks";
import { getVerifiedUid } from "@/server/utils/auth";

interface RouteParams {
  params: Promise<{ id: string; categoryId: string; snapPickId: string }>;
}

// Confirms the caller is a member of the group and the snap pick exists under the
// given category. Returns an error NextResponse on failure, or undefined on success.
async function authorizeMember(
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

export async function GET(_request: Request, { params }: RouteParams) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId, categoryId, snapPickId } = await params;
  const denied = await authorizeMember(uid, groupId, categoryId, snapPickId);
  if (denied) return denied;

  const options = await getSnapPickOptions(snapPickId);

  return NextResponse.json({ options });
}

export async function POST(request: Request, { params }: RouteParams) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId, categoryId, snapPickId } = await params;
  const denied = await authorizeMember(uid, groupId, categoryId, snapPickId);
  if (denied) return denied;

  let body: { title: unknown };
  try {
    body = (await request.json()) as { title: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const title = body.title.trim();

  const { id: optionId, addedAt } = await addSnapPickOption(snapPickId, {
    title,
    addedBy: uid,
  });

  return NextResponse.json(
    { optionId, addedAt: addedAt.toISOString() },
    { status: 201 },
  );
}
