import { redirect } from "next/navigation";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupInviteByToken } from "@/server/data/invites";
import { getGroupById } from "@/server/data/groups";
import { InviteView } from "./InviteView";
import { INVITE_COPY } from "./copy";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { token } = await params;
  const invite = await getGroupInviteByToken(token);

  if (!invite?.active) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">{INVITE_COPY.notFound}</p>
      </main>
    );
  }

  const group = await getGroupById(invite.groupId);

  if (!group) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <p className="text-muted-foreground">{INVITE_COPY.notFound}</p>
      </main>
    );
  }

  const isMember = group.memberIds.includes(uid);

  return (
    <InviteView
      groupId={group.id}
      groupName={group.name}
      token={token}
      isMember={isMember}
    />
  );
}
