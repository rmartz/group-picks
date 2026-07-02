import { notFound, redirect } from "next/navigation";

import { getCategoryById } from "@/server/data/categories";
import { getGroupById } from "@/server/data/groups";
import {
  getSnapPickVotes,
  resolveActiveActivation,
} from "@/server/data/snap-pick-activations";
import { getSnapPickById, getSnapPickOptions } from "@/server/data/snap-picks";
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
  const activation = await resolveActiveActivation(snapPickId);

  const winnerTitle =
    activation?.winnerId !== undefined
      ? options.find((option) => option.id === activation.winnerId)?.title
      : undefined;
  const activeOptions = options.filter(
    (option) => option.removedAt === undefined,
  );

  // While a run is open, load the current member's cast pairs so the voting
  // screen resumes from their own remaining matchup queue rather than restarting.
  const activationInProgress =
    activation !== undefined && activation.closedAt === undefined;
  const votes = activationInProgress
    ? await getSnapPickVotes(activation.id)
    : [];
  const votedPairKeys = votes
    .filter((vote) => vote.votedBy === uid)
    .map((vote) => vote.pairKey);

  return (
    <SnapPickDetailView
      snapPick={snapPick}
      groupId={id}
      currentUserId={uid}
      options={activeOptions}
      activation={activation}
      winnerTitle={winnerTitle}
      votedPairKeys={votedPairKeys}
    />
  );
}
