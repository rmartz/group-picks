import { NextResponse } from "next/server";

import type { GroupPick } from "@/lib/types/pick";
import { getCategoryById } from "@/server/data/categories";
import { getGroupById, recordGroupActivity } from "@/server/data/groups";
import {
  addOption,
  getOptionsByCategory,
  getOptionsByPick,
  joinOption,
} from "@/server/data/options";
import {
  assertPickIsOpenForWrite,
  getPicksByCategory,
  PICK_CLOSED_API_ERROR,
  PickNotFoundError,
  PickWriteClosedError,
} from "@/server/data/picks";
import { getVerifiedUid } from "@/server/utils/auth";

async function assertPickIsOpenOrGetErrorResponse(
  categoryId: string,
  pickId: string,
): Promise<GroupPick | NextResponse> {
  try {
    return await assertPickIsOpenForWrite(categoryId, pickId);
  } catch (err) {
    if (err instanceof PickNotFoundError) {
      return NextResponse.json({ error: "Pick not found" }, { status: 404 });
    }
    if (err instanceof PickWriteClosedError) {
      return NextResponse.json(
        { error: PICK_CLOSED_API_ERROR },
        { status: 409 },
      );
    }
    throw err;
  }
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

  const { id: groupId, categoryId, pickId } = await params;
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

  const [currentOptions, priorPicks] = await Promise.all([
    getOptionsByPick(pickId),
    getPicksByCategory(categoryId),
  ]);

  const priorPickIds = priorPicks
    .filter((p) => p.id !== pickId)
    .map((p) => p.id);
  const priorOptions = await getOptionsByCategory(priorPickIds);

  const currentTitlesLower = new Set(
    currentOptions.map((o) => o.title.toLowerCase()),
  );
  const suggestions = priorOptions.filter(
    (o) =>
      o.ownerIds.includes(uid) &&
      !currentTitlesLower.has(o.title.toLowerCase()),
  );

  const uniqueSuggestionTitles = new Set<string>();
  const dedupedSuggestions = suggestions.filter((o) => {
    const key = o.title.toLowerCase();
    if (uniqueSuggestionTitles.has(key)) return false;
    uniqueSuggestionTitles.add(key);
    return true;
  });

  return NextResponse.json({
    options: currentOptions,
    suggestions: dedupedSuggestions,
  });
}

export async function POST(
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

  const { id: groupId, categoryId, pickId } = await params;
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

  const pickOrResponse = await assertPickIsOpenOrGetErrorResponse(
    categoryId,
    pickId,
  );
  if (pickOrResponse instanceof Response) {
    return pickOrResponse;
  }
  const pick = pickOrResponse;

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

  const existingOptions = await getOptionsByPick(pickId);
  const existing = existingOptions.find(
    (o) => o.title.toLowerCase() === title.toLowerCase(),
  );

  if (existing) {
    if (!existing.ownerIds.includes(uid)) {
      await joinOption(pickId, existing.id, uid);
    }
    return NextResponse.json({ optionId: existing.id }, { status: 200 });
  }

  const { id: optionId } = await addOption(pickId, title, uid);
  try {
    await recordGroupActivity(groupId, {
      summary: `Pick "${pick.title}" · new option`,
    });
  } catch (error) {
    console.error("Failed to record group activity:", error);
  }

  return NextResponse.json({ optionId }, { status: 201 });
}
