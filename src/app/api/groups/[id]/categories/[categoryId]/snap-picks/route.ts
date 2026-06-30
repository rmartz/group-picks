import { NextResponse } from "next/server";

import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import { createSnapPick } from "@/server/data/snap-picks";
import { getVerifiedUid } from "@/server/utils/auth";
import { isGroupAdmin } from "@/server/utils/permissions";

// Default head-to-head run length for a newly created Snap Pick (5 minutes).
// Activations may override this; the container just seeds a sensible default.
const DEFAULT_SNAP_PICK_DURATION_MS = 5 * 60 * 1000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; categoryId: string }> },
) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId, categoryId } = await params;
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

  if (group.picksRestricted && !isGroupAdmin(uid, group)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { title: unknown; defaultDurationMs: unknown };
  try {
    body = (await request.json()) as {
      title: unknown;
      defaultDurationMs: unknown;
    };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }
  const title = body.title.trim();

  let defaultDurationMs = DEFAULT_SNAP_PICK_DURATION_MS;
  if (body.defaultDurationMs !== undefined) {
    if (
      typeof body.defaultDurationMs !== "number" ||
      !Number.isInteger(body.defaultDurationMs) ||
      body.defaultDurationMs < 1
    ) {
      return NextResponse.json(
        { error: "defaultDurationMs must be a positive integer" },
        { status: 400 },
      );
    }
    defaultDurationMs = body.defaultDurationMs;
  }

  const { id: snapPickId, createdAt } = await createSnapPick({
    title,
    categoryId,
    creatorId: uid,
    defaultDurationMs,
  });

  return NextResponse.json(
    { snapPickId, creatorId: uid, createdAt: createdAt.toISOString() },
    { status: 201 },
  );
}
