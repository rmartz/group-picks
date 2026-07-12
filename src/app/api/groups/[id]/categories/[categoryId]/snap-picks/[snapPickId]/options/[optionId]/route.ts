import { NextResponse } from "next/server";

import {
  getSnapPickOptionById,
  removeSnapPickOption,
} from "@/server/data/snap-picks";
import { getVerifiedUid } from "@/server/utils/auth";
import { authorizeSnapPickMember } from "@/server/utils/snap-pick-auth";

interface RouteParams {
  params: Promise<{
    id: string;
    categoryId: string;
    snapPickId: string;
    optionId: string;
  }>;
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId, categoryId, snapPickId, optionId } = await params;
  const denied = await authorizeSnapPickMember(
    uid,
    groupId,
    categoryId,
    snapPickId,
  );
  if (denied) return denied;

  const option = await getSnapPickOptionById(snapPickId, optionId);

  if (!option || option.removedAt !== undefined) {
    return NextResponse.json({ error: "Option not found" }, { status: 404 });
  }

  // Only the member who added an option may remove it from the pool.
  if (option.addedBy !== uid) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { removedAt } = await removeSnapPickOption(snapPickId, optionId);

  return NextResponse.json({ removedAt: removedAt.toISOString() });
}
