import { NextResponse } from "next/server";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import {
  getUserInterestsForPick,
  toggleOptionInterest,
} from "@/server/data/interests";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; pickId: string }> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, pickId } = await params;
  const group = await getGroupById(id);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (!group.memberIds.includes(uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId");

  if (!categoryId) {
    return NextResponse.json(
      { error: "categoryId is required" },
      { status: 400 },
    );
  }

  const interests = await getUserInterestsForPick(categoryId, pickId, uid);

  return NextResponse.json({
    interestedOptionIds: interests.interestedOptionIds,
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; pickId: string }> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, pickId } = await params;
  const group = await getGroupById(id);

  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  if (!group.memberIds.includes(uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { optionId: unknown; categoryId: unknown };
  try {
    body = (await request.json()) as { optionId: unknown; categoryId: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.optionId !== "string" || !body.optionId.trim()) {
    return NextResponse.json(
      { error: "optionId is required" },
      { status: 400 },
    );
  }

  if (typeof body.categoryId !== "string" || !body.categoryId.trim()) {
    return NextResponse.json(
      { error: "categoryId is required" },
      { status: 400 },
    );
  }

  const optionId = body.optionId.trim();
  const categoryId = body.categoryId.trim();

  const interested = await toggleOptionInterest(
    categoryId,
    pickId,
    optionId,
    uid,
  );

  return NextResponse.json({ interested });
}
