import { notFound, redirect } from "next/navigation";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import { getOrCreateGroupInvite } from "@/server/data/invites";
import { GroupDetailView } from "./GroupDetailView";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id } = await params;
  const group = await getGroupById(id);

  if (!group) notFound();

  const invite = await getOrCreateGroupInvite(id);

  return (
    <GroupDetailView
      group={group}
      inviteToken={invite.token}
      inviteExpiresAt={invite.expiresAt?.toISOString() ?? null}
    />
  );
}
