import { redirect } from "next/navigation";

import { JOIN_GROUP_COPY } from "@/app/groups/join/copy";
import { getCategoriesByGroupId } from "@/server/data/categories";
import { getGroupById, getMemberDisplayNames } from "@/server/data/groups";
import { getGroupInviteByToken } from "@/server/data/invites";
import { getPicksByCategory } from "@/server/data/picks";
import { getVerifiedUid } from "@/server/utils/auth";

import { InviteLanding } from "./InviteLanding";
import { InviteLandingView } from "./InviteLandingView";

interface InvitePageProps {
  params: Promise<{ token: string }>;
}

interface InviteErrorPageProps {
  title: string;
  description: string;
}

function InviteErrorPage({ title, description }: InviteErrorPageProps) {
  return (
    <main className="mx-auto max-w-lg space-y-4 p-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="text-sm text-gray-600">{description}</p>
    </main>
  );
}

const INVITE_TOKEN_FORMAT = /^[A-Za-z0-9_-]+$/;

async function getCurrentPickTitle(
  groupId: string,
): Promise<string | undefined> {
  const categories = await getCategoriesByGroupId(groupId);
  const pickArrays = await Promise.all(
    categories.map((c) => getPicksByCategory(c.id)),
  );
  const openPicks = pickArrays
    .flat()
    .filter((p) => p.closedAt === undefined)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return openPicks[0]?.title;
}

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
  const uid = await getVerifiedUid();

  if (uid !== undefined && group.memberIds.includes(uid)) {
    redirect(`/groups/${invite.groupId}`);
  }

  const [memberNameRecords, currentPickTitle] = await Promise.all([
    getMemberDisplayNames(group.memberIds),
    getCurrentPickTitle(invite.groupId),
  ]);

  const memberNames = memberNameRecords.map(({ name }) => {
    const firstName = name.split(" ")[0];
    return firstName ?? name;
  });

  if (uid !== undefined) {
    return (
      <InviteLanding
        token={token}
        groupName={group.name}
        memberCount={group.memberIds.length}
        memberNames={memberNames}
        currentPickTitle={currentPickTitle}
        signInHref={signInHref}
      />
    );
  }

  return (
    <InviteLandingView
      groupName={group.name}
      memberCount={group.memberIds.length}
      memberNames={memberNames}
      currentPickTitle={currentPickTitle}
      signInHref={signInHref}
    />
  );
}
