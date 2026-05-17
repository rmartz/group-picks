import { NextResponse } from "next/server";

import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import {
  assertPickIsOpenForWrite,
  PICK_CLOSED_API_ERROR,
  PickWriteClosedError,
  updatePick,
} from "@/server/data/picks";
import { getVerifiedUid } from "@/server/utils/auth";

interface UpdatePickRequestBody {
  title: unknown;
  description: unknown;
  topCount: unknown;
  dueDate?: unknown;
}

function parseDueDate(value: unknown): Date | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return undefined;
  }

  return parsedDate;
}

export async function PATCH(
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

  let body: UpdatePickRequestBody;
  try {
    body = (await request.json()) as UpdatePickRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.title !== "string" || !body.title.trim()) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  if (
    typeof body.topCount !== "number" ||
    !Number.isInteger(body.topCount) ||
    body.topCount < 1
  ) {
    return NextResponse.json(
      { error: "topCount must be an integer greater than 0" },
      { status: 400 },
    );
  }

  if (
    body.dueDate !== undefined &&
    body.dueDate !== null &&
    body.dueDate !== "" &&
    (typeof body.dueDate !== "string" ||
      Number.isNaN(new Date(body.dueDate).getTime()))
  ) {
    return NextResponse.json(
      { error: "dueDate must be a valid date" },
      { status: 400 },
    );
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
    if (err instanceof Error && err.message === "Pick not found") {
      return NextResponse.json({ error: "Pick not found" }, { status: 404 });
    }
    throw err;
  }

  const title = body.title.trim();
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const topCount = body.topCount;
  const dueDate = parseDueDate(body.dueDate);

  await updatePick(categoryId, pickId, {
    title,
    description,
    topCount,
    dueDate,
  });

  return NextResponse.json({ pickId });
}
