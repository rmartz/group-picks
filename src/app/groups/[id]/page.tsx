import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
import { getGroupInviteByToken } from "@/server/data/invites";
import { getCategoriesByGroupId } from "@/server/data/categories";
import { GroupDetailView } from "./GroupDetailView";
import { InviteSection } from "./InviteSection";

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

  if (!group.memberIds.includes(uid)) notFound();

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const forwarded = headersList.get("x-forwarded-proto");
  const protocol =
    forwarded?.split(",").at(0)?.trim() ??
    (/^(localhost|127\.0\.0\.1)(:\d+)?$/.exec(host) ? "http" : "https");
  const origin = `${protocol}://${host}`;

  const [invite, categories] = await Promise.all([
    group.inviteToken
      ? getGroupInviteByToken(group.inviteToken)
      : Promise.resolve(undefined),
    getCategoriesByGroupId(id),
  ]);

  return (
    <>
      <GroupDetailView group={group} categories={categories} />
      <InviteSection
        groupId={group.id}
        initialToken={group.inviteToken}
        initialExpiresAt={invite?.expiresAt?.toISOString()}
        origin={origin}
      />
    </>
  );
}
