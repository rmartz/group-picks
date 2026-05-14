import { redirect } from "next/navigation";

import { getGroupById } from "@/server/data/groups";
import { getGroupInviteByToken } from "@/server/data/invites";
import { getVerifiedUid } from "@/server/utils/auth";

import { JOIN_GROUP_COPY } from "./copy";
import { JoinGroupForm } from "./JoinGroupForm";

interface JoinGroupPageProps {
  searchParams: Promise<{ token?: string }>;
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

export default async function JoinGroupPage({
  searchParams,
}: JoinGroupPageProps) {
  const { token } = await searchParams;

  const uid = await getVerifiedUid();
  if (!uid) {
    const signInUrl = new URLSearchParams(
      token ? { invite_token: token } : {},
    ).toString();
    redirect(`/sign-in${signInUrl ? `?${signInUrl}` : ""}`);
  }

  if (!token) {
    return (
      <InviteErrorPage
        title={JOIN_GROUP_COPY.invalidTitle}
        description={JOIN_GROUP_COPY.invalidDescription}
      />
    );
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

  if (invite.expiresAt !== undefined && invite.expiresAt < new Date()) {
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
