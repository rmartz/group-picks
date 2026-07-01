import { NextResponse } from "next/server";

import {
  addSnapPickOption,
  getSnapPickOptions,
} from "@/server/data/snap-picks";
import { getVerifiedUid } from "@/server/utils/auth";
import { authorizeSnapPickMember } from "@/server/utils/snap-pick-auth";

interface RouteParams {
  params: Promise<{ id: string; categoryId: string; snapPickId: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId, categoryId, snapPickId } = await params;
  const denied = await authorizeSnapPickMember(
    uid,
    groupId,
    categoryId,
    snapPickId,
  );
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
  const denied = await authorizeSnapPickMember(
    uid,
    groupId,
    categoryId,
    snapPickId,
  );
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
