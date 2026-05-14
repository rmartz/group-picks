import { notFound, redirect } from "next/navigation";

import type { GroupPick } from "@/lib/types/pick";
import { getCategoriesByGroupId } from "@/server/data/categories";
import { getGroupById, getMemberDisplayNames } from "@/server/data/groups";
import { getGroupInviteByToken } from "@/server/data/invites";
import { getPicksByCategory } from "@/server/data/picks";
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

  const [invite, categories, memberNames] = await Promise.all([
    getGroupInviteByToken(group.inviteToken),
    getCategoriesByGroupId(id),
    getMemberDisplayNames(group.memberIds),
  ]);

  const pickArrays = await Promise.all(
    categories.map((c) => getPicksByCategory(c.id)),
  );
  const picksByCategory: Record<string, GroupPick[]> = Object.fromEntries(
    categories.map((c, i) => [c.id, pickArrays[i] ?? []]),
  );

  return (
    <GroupDetailClient
      group={group}
      categories={categories}
      currentUserId={uid}
      initialInviteExpiresAt={invite?.expiresAt?.toISOString()}
      memberNames={memberNames}
      picksByCategory={picksByCategory}
    />
  );
}
