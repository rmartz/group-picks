import { notFound, redirect } from "next/navigation";

import { InviteMode } from "@/lib/types/invite";
import { getCategoriesByGroupId } from "@/server/data/categories";
import { markGroupSeen } from "@/server/data/groupActivity";
import { getGroupById, getMemberDisplayNames } from "@/server/data/groups";
import { getGroupInviteByToken } from "@/server/data/invites";
import { getPicksByCategoryIds } from "@/server/data/picks";
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

  const categoriesPromise = getCategoriesByGroupId(id);

  const [invite, categories, memberNames, picksByCategory] = await Promise.all([
    getGroupInviteByToken(group.inviteToken),
    categoriesPromise,
    getMemberDisplayNames(group.memberIds),
    categoriesPromise.then((resolvedCategories) =>
      getPicksByCategoryIds(resolvedCategories.map((category) => category.id)),
    ),
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
    />
  );
}
