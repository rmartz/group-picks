import { notFound, redirect } from "next/navigation";
import { after } from "next/server";

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

  // Defer the lastSeenAt write until after the response is sent. On Vercel
  // Fluid Compute a fire-and-forget promise may not flush before the function
  // instance is recycled; after() extends the function lifetime so the write
  // reliably completes without blocking the page render.
  after(() => markGroupSeen(uid, id));

  const [invite, categories, memberNames] = await Promise.all([
    getGroupInviteByToken(group.inviteToken),
    getCategoriesByGroupId(id),
    getMemberDisplayNames(group.memberIds),
  ]);
  const categoryIds = categories.map((category) => category.id);

  const [picksByCategory, activeSnapPicks] = await Promise.all([
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
