import { redirect } from "next/navigation";
import { getVerifiedUid } from "@/server/utils/auth";
import { getGroupInviteByToken } from "@/server/data/invites";
import { getGroupById } from "@/server/data/groups";
import { JoinGroupForm } from "@/app/groups/join/JoinGroupForm";
import { JOIN_GROUP_COPY } from "@/app/groups/join/copy";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

function InviteErrorPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-gray-600">{description}</p>
    </main>
  );
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  const uid = await getVerifiedUid();
  if (!uid) {
    redirect(`/sign-in?invite_token=${token}`);
  }

  const invite = await getGroupInviteByToken(token);

  if (!invite) {
    return (
      <InviteErrorPage
        title={JOIN_GROUP_COPY.invalidTitle}
        description={JOIN_GROUP_COPY.invalidDescription}
      />
    );
  }

  if (!invite.active) {
    return (
      <InviteErrorPage
        title={JOIN_GROUP_COPY.revokedTitle}
        description={JOIN_GROUP_COPY.revokedDescription}
      />
    );
  }

  const now = new Date();
  if (invite.expiresAt !== undefined && invite.expiresAt < now) {
    return (
      <InviteErrorPage
        title={JOIN_GROUP_COPY.expiredTitle}
        description={JOIN_GROUP_COPY.expiredDescription}
      />
    );
  }

  const group = await getGroupById(invite.groupId);

  if (!group) {
    return (
      <InviteErrorPage
        title={JOIN_GROUP_COPY.invalidTitle}
        description={JOIN_GROUP_COPY.invalidDescription}
      />
    );
  }

  return <JoinGroupForm token={token} groupName={group.name} />;
}
