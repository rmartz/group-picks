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

interface CurrentPick {
  title: string;
  dueDate?: Date;
}

async function getCurrentPick(
  groupId: string,
): Promise<CurrentPick | undefined> {
  const categories = await getCategoriesByGroupId(groupId);
  const pickArrays = await Promise.all(
    categories.map((c) => getPicksByCategory(c.id)),
  );
  const openPicks = pickArrays
    .flat()
    .filter((p) => p.closedAt === undefined)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const pick = openPicks[0];
  if (!pick) return undefined;
  return { title: pick.title, dueDate: pick.dueDate };
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

  const inviterUids = invite.createdBy ? [invite.createdBy] : [];
  const [memberNameRecords, currentPick, inviterNameRecords] =
    await Promise.all([
      getMemberDisplayNames(group.memberIds),
      getCurrentPick(invite.groupId),
      getMemberDisplayNames(inviterUids),
    ]);

  const memberNames = memberNameRecords.map(({ name }) => {
    const firstName = name.split(" ")[0];
    return firstName ?? name;
  });
  const invitedByName = inviterNameRecords[0]?.name.split(" ")[0];

  if (uid !== undefined) {
    return (
      <InviteLanding
        token={token}
        groupName={group.name}
        groupEmoji={group.emoji}
        memberCount={group.memberIds.length}
        memberNames={memberNames}
        currentPick={currentPick}
        invitedByName={invitedByName}
        signInHref={signInHref}
      />
    );
  }

  return (
    <InviteLandingView
      groupName={group.name}
      groupEmoji={group.emoji}
      memberCount={group.memberIds.length}
      memberNames={memberNames}
      currentPick={currentPick}
      invitedByName={invitedByName}
      signInHref={signInHref}
    />
  );
}
