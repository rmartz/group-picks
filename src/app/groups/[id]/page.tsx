import { notFound, redirect } from "next/navigation";

import { InviteMode } from "@/lib/types/invite";
import { getCategoriesByGroupId } from "@/server/data/categories";
import { markGroupSeen } from "@/server/data/groupActivity";
import { getGroupById, getMemberDisplayNames } from "@/server/data/groups";
import { getGroupInviteByToken } from "@/server/data/invites";
import { getPicksByCategoryIds } from "@/server/data/picks";
import { getActiveSnapPickActivationsByCategories } from "@/server/data/snap-picks";
import { getVerifiedUid } from "@/server/utils/auth";

import { GroupDetailClient } from "./GroupDetailClient";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id } = await params;
  const group = await getGroupById(id);

  if (!group?.memberIds.includes(uid)) notFound();

  void markGroupSeen(uid, id);

  // Kick off the category-independent fetches, then await categories so the
  // category-dependent fetches (picks, snap picks) can start — all resolve
  // together in the Promise.all below.
  const invitePromise = getGroupInviteByToken(group.inviteToken);
  const memberNamesPromise = getMemberDisplayNames(group.memberIds);
  const categories = await getCategoriesByGroupId(id);
  const categoryIds = categories.map((category) => category.id);

  const [invite, memberNames, picksByCategory, activeSnapPicks] =
    await Promise.all([
      invitePromise,
      memberNamesPromise,
      getPicksByCategoryIds(categoryIds),
      getActiveSnapPickActivationsByCategories(categoryIds),
    ]);

  return (
    <GroupDetailClient
      group={group}
      categories={categories}
      currentUserId={uid}
      initialInviteExpiresAt={invite?.expiresAt?.toISOString()}
      initialInviteMode={invite?.mode ?? InviteMode.Group}
      memberNames={memberNames}
      picksByCategory={picksByCategory}
      activeSnapPicks={activeSnapPicks}
    />
  );
}
