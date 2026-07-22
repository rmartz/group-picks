import { notFound, redirect } from "next/navigation";

import type { SnapPickHistoryEntry } from "@/lib/types/snap-pick";
import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import {
  getSnapPickVotesByMember,
  resolveActiveActivation,
} from "@/server/data/snap-pick-activations";
import { getSnapPickPreferences } from "@/server/data/snap-pick-preferences";
import {
  getClosedActivations,
  getSnapPickById,
  getSnapPickOptions,
} from "@/server/data/snap-picks";
import { getVerifiedUid } from "@/server/utils/auth";

import { SnapPickDetailView } from "./SnapPickDetailView";

export default async function SnapPickDetailPage({
  params,
}: {
  params: Promise<{ id: string; categoryId: string; snapPickId: string }>;
}) {
  const uid = await getVerifiedUid();
  if (!uid) redirect("/sign-in");

  const { id, categoryId, snapPickId } = await params;

  const [group, category, snapPick, options] = await Promise.all([
    getGroupById(id),
    getCategoryById(categoryId),
    getSnapPickById(categoryId, snapPickId),
    getSnapPickOptions(snapPickId, true),
  ]);

  if (!group?.memberIds.includes(uid)) notFound();
  if (category?.groupId !== id) notFound();
  if (!snapPick) notFound();

  // resolveActiveActivation performs the lazy auto-close: if the open run's
  // deadline has passed, it computes and persists the winner before returning.
  // Called after auth guards so only authorized members trigger the side-effect.
  const [activation, closedActivations] = await Promise.all([
    resolveActiveActivation(snapPickId),
    getClosedActivations(snapPickId),
  ]);

  const winnerTitle =
    activation?.winnerId !== undefined
      ? options.find((option) => option.id === activation.winnerId)?.title
      : undefined;
  const activeOptions = options.filter(
    (option) => option.removedAt === undefined,
  );

  const activationInProgress =
    activation !== undefined && activation.closedAt === undefined;
  // While a run is open, load the member's cast pairs (to resume their queue) and
  // their global preference model (to focus the matchup pool on relevant options).
  const [memberVotes, ratings] = activationInProgress
    ? await Promise.all([
        getSnapPickVotesByMember(activation.id, uid),
        getSnapPickPreferences(snapPickId, uid),
      ])
    : [[], {}];
  const votedPairKeys = memberVotes.map((vote) => vote.pairKey);

  // resolveActiveActivation may have just lazily closed the previously-open run
  // on this read; getClosedActivations ran concurrently and would miss it, so
  // fold it in (guarding against a duplicate) before building the timeline.
  const justClosed =
    activation?.closedAt !== undefined &&
    !closedActivations.some((closed) => closed.id === activation.id)
      ? [activation]
      : [];
  const timeline = [...justClosed, ...closedActivations];

  // Each closed run's participant count is denormalized onto the activation as
  // members cast their first votes (see #399), so it comes back with the
  // activation documents already fetched above — no separate votes read needed.
  const historyEntries: SnapPickHistoryEntry[] = timeline.map((closed) => ({
    activationId: closed.id,
    closedAt: closed.closedAt ?? closed.closesAt,
    winnerTitle:
      closed.winnerId !== undefined
        ? options.find((option) => option.id === closed.winnerId)?.title
        : undefined,
    participantCount: closed.participantCount,
  }));

  return (
    <SnapPickDetailView
      snapPick={snapPick}
      groupId={id}
      groupName={group.name}
      categoryName={category.name}
      currentUserId={uid}
      options={activeOptions}
      activation={activation}
      winnerTitle={winnerTitle}
      votedPairKeys={votedPairKeys}
      ratings={ratings}
      historyEntries={historyEntries}
    />
  );
}
