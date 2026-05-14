import { redirect } from "next/navigation";

import { JOIN_GROUP_COPY } from "@/app/groups/join/copy";
import { JoinGroupForm } from "@/app/groups/join/JoinGroupForm";
import { getGroupById } from "@/server/data/groups";
import { getGroupInviteByToken } from "@/server/data/invites";
import { getVerifiedUid } from "@/server/utils/auth";

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

const INVITE_TOKEN_FORMAT = /^[A-Za-z0-9_-]+$/;

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  if (!INVITE_TOKEN_FORMAT.test(token)) {
    return (
      <InviteErrorPage
        title={JOIN_GROUP_COPY.invalidTitle}
        description={JOIN_GROUP_COPY.invalidDescription}
      />
    );
  }

  const uid = await getVerifiedUid();
  if (!uid) {
    const signInUrl = new URLSearchParams({ invite_token: token }).toString();
    redirect(`/sign-in?${signInUrl}`);
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

  const signInHref = `/sign-in?${new URLSearchParams({ invite_token: token }).toString()}`;
  return (
    <JoinGroupForm
      token={token}
      groupName={group.name}
      memberCount={group.memberIds.length}
      signInHref={signInHref}
    />
  );
}
