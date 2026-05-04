import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupById } from "@/server/data/groups";
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

  const headersList = await headers();
  const host = headersList.get("host") ?? "";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const origin = `${protocol}://${host}`;

  return (
    <>
      <GroupDetailView group={group} />
      <InviteSection
        groupId={group.id}
        initialToken={group.inviteToken}
        origin={origin}
      />
    </>
  );
}
