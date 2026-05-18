import { NextResponse } from "next/server";

import type { RankingTier } from "@/lib/types/ranking";
import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import { getPickById } from "@/server/data/picks";
import { getRankingByUser, saveRanking } from "@/server/data/rankings";
import { getVerifiedUid } from "@/server/utils/auth";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; categoryId: string; pickId: string }>;
  },
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

  const category = await getCategoryById(categoryId);
  if (category?.groupId !== id) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const pick = await getPickById(categoryId, pickId);
  if (!pick) {
    return NextResponse.json({ error: "Pick not found" }, { status: 404 });
  }

  const rankings = await getRankingByUser(pickId, uid);

  return NextResponse.json({ rankings });
}

export async function PUT(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string; categoryId: string; pickId: string }>;
  },
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

  const category = await getCategoryById(categoryId);
  if (category?.groupId !== id) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const pick = await getPickById(categoryId, pickId);
  if (!pick) {
    return NextResponse.json({ error: "Pick not found" }, { status: 404 });
  }

  const body = (await request.json()) as {
    assignments: Record<string, RankingTier>;
  };
  await saveRanking(pickId, uid, body.assignments);

  return NextResponse.json({ ok: true });
}
