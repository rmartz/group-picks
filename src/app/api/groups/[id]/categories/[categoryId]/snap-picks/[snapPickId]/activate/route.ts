import { NextResponse } from "next/server";

import {
  computeClosesAt,
  isDurationPreset,
  type SnapPickDurationChoice,
} from "@/lib/snap-pick-activation";
import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import {
  createSnapPickActivation,
  getOpenActivation,
} from "@/server/data/snap-pick-activations";
import { getSnapPickById } from "@/server/data/snap-picks";
import { getVerifiedUid } from "@/server/utils/auth";

interface RouteParams {
  params: Promise<{ id: string; categoryId: string; snapPickId: string }>;
}

// Parses the request body's duration into a validated choice, or undefined when
// the shape is invalid.
function parseDuration(value: unknown): SnapPickDurationChoice | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const kind = (value as { kind?: unknown }).kind;

  if (kind === "preset") {
    const preset = (value as { preset?: unknown }).preset;
    return typeof preset === "string" && isDurationPreset(preset)
      ? { kind: "preset", preset }
      : undefined;
  }

  if (kind === "custom") {
    const durationMs = (value as { durationMs?: unknown }).durationMs;
    return typeof durationMs === "number" &&
      Number.isFinite(durationMs) &&
      durationMs > 0
      ? { kind: "custom", durationMs }
      : undefined;
  }

  return undefined;
}

export async function PUT(request: Request, { params }: RouteParams) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId, categoryId, snapPickId } = await params;
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

  let body: { duration: unknown };
  try {
    body = (await request.json()) as { duration: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const duration = parseDuration(body.duration);
  if (!duration) {
    return NextResponse.json({ error: "Invalid duration" }, { status: 400 });
  }

  const open = await getOpenActivation(snapPickId);
  if (open) {
    return NextResponse.json(
      { error: "An activation is already in progress" },
      { status: 409 },
    );
  }

  const startedAt = new Date();
  const closesAt = computeClosesAt(startedAt, duration);
  const { id: activationId } = await createSnapPickActivation({
    snapPickId,
    startedAt,
    closesAt,
    startedBy: uid,
  });

  return NextResponse.json(
    { activationId, closesAt: closesAt.toISOString() },
    { status: 201 },
  );
}
