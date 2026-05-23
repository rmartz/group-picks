import { NextResponse } from "next/server";

import { RankingTier } from "@/lib/types/ranking";
import { getCategoryById } from "@/server/data/categories";
import { getGroupById, recordGroupActivity } from "@/server/data/groups";
import { getPickById } from "@/server/data/picks";
import { getRankingByUser, saveRanking } from "@/server/data/rankings";
import { getVerifiedUid } from "@/server/utils/auth";

const VALID_RANKING_TIERS = new Set(Object.values(RankingTier));

function isRankingAssignments(
  value: unknown,
): value is Record<string, RankingTier> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (tier) =>
      typeof tier === "string" && VALID_RANKING_TIERS.has(tier as RankingTier),
  );
}

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

  if (!group.memberIds.includes(uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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

  if (!group.memberIds.includes(uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const category = await getCategoryById(categoryId);
  if (category?.groupId !== id) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  const pick = await getPickById(categoryId, pickId);
  if (!pick) {
    return NextResponse.json({ error: "Pick not found" }, { status: 404 });
  }

  let body: { assignments: unknown };
  try {
    body = (await request.json()) as { assignments: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isRankingAssignments(body.assignments)) {
    return NextResponse.json({ error: "Invalid tier value" }, { status: 400 });
  }

  const existingRanking = await getRankingByUser(pickId, uid);
  const isResubmission = Object.keys(existingRanking).length > 0;
  await saveRanking(pickId, uid, body.assignments);
  if (!isResubmission) {
    const rankedCount = Object.keys(body.assignments).length;
    const rankedCountText = rankedCount.toString();
    try {
      await recordGroupActivity(id, {
        summary: `Ranking submitted · ${rankedCountText} options`,
      });
    } catch (error) {
      console.error("Failed to record group activity:", error);
    }
  }

  return NextResponse.json({ ok: true });
}
