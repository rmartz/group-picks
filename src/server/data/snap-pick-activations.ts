import {
  type DataSnapshot,
  getDatabase,
  ServerValue,
} from "firebase-admin/database";

import { getAdminApp } from "@/lib/firebase/admin";
import {
  firebaseToSnapPickVote,
  snapPickActivationToFirebase,
  snapPickVoteToFirebase,
} from "@/lib/firebase/schema/snap-pick";
import { computeSnapPickWinner } from "@/lib/snap-pick-activation";
import { pairKey } from "@/lib/snap-pick-pairing";
import type { SnapPickActivation, SnapPickVote } from "@/lib/types/snap-pick";

import { getSnapPickActivations, getSnapPickOptions } from "./snap-picks";

export async function createSnapPickActivation(
  activation: Pick<
    SnapPickActivation,
    "snapPickId" | "startedAt" | "closesAt" | "startedBy"
  >,
): Promise<{ id: string }> {
  const db = getDatabase(getAdminApp());
  const ref = db.ref(`snap-pick-activations/${activation.snapPickId}`).push();
  const id = ref.key;
  if (!id) throw new Error("Failed to generate snap pick activation ID");

  await ref.set(snapPickActivationToFirebase(activation));

  return { id };
}

// Writes the computed close data to an existing activation.
export async function closeSnapPickActivation(
  snapPickId: string,
  activationId: string,
  result: { closedAt: Date; winnerId?: string },
): Promise<void> {
  const db = getDatabase(getAdminApp());
  // RTDB update() treats null as "delete this key", so an absent winner is
  // written as null (not undefined, which update() rejects) to leave no field.
  await db.ref(`snap-pick-activations/${snapPickId}/${activationId}`).update({
    closedAt: result.closedAt.getTime(),
    winnerId: result.winnerId ?? null,
  });
}

// Bumps the denormalized participant count on an activation by one. Called when
// a member casts their first vote in the run so the history timeline can report
// participation without reading every vote (see #399). ServerValue.increment is
// an atomic server-side counter, so concurrent first-votes from different
// members each apply without clobbering one another (and it treats an absent
// field as 0, keeping legacy activations correct).
export async function incrementSnapPickActivationParticipantCount(
  snapPickId: string,
  activationId: string,
): Promise<void> {
  const db = getDatabase(getAdminApp());
  await db
    .ref(`snap-pick-activations/${snapPickId}/${activationId}/participantCount`)
    .set(ServerValue.increment(1));
}

export async function recordSnapPickVote(
  activationId: string,
  vote: Pick<SnapPickVote, "winnerId" | "loserId" | "votedBy">,
): Promise<{ id: string; votedAt: Date; pairKey: string }> {
  const db = getDatabase(getAdminApp());
  const ref = db.ref(`snap-pick-votes/${activationId}`).push();
  const id = ref.key;
  if (!id) throw new Error("Failed to generate snap pick vote ID");

  const votedAt = new Date();
  const key = pairKey(vote.winnerId, vote.loserId);
  await ref.set(snapPickVoteToFirebase({ ...vote, votedAt, pairKey: key }));

  return { id, votedAt, pairKey: key };
}

function snapshotToVotes(snap: DataSnapshot): SnapPickVote[] {
  if (!snap.exists()) return [];

  const data = snap.val() as Record<string, unknown>;
  return Object.entries(data).map(([id, voteData]) =>
    firebaseToSnapPickVote(id, voteData),
  );
}

// Reads every vote cast in an activation. Used where the full set is needed —
// winner computation and per-activation participant counts — since those must
// aggregate across all members.
export async function getSnapPickVotes(
  activationId: string,
): Promise<SnapPickVote[]> {
  const db = getDatabase(getAdminApp());
  const snap = await db.ref(`snap-pick-votes/${activationId}`).get();

  return snapshotToVotes(snap);
}

// Reads only the votes a single member cast in an activation, filtering at the
// Realtime Database query layer so only their votes cross the network. Used for the
// member's own resume queue and the duplicate-vote guard, which never need any
// other member's votes.
export async function getSnapPickVotesByMember(
  activationId: string,
  votedBy: string,
): Promise<SnapPickVote[]> {
  const db = getDatabase(getAdminApp());
  // Requires a Firebase Realtime Database index on "votedBy" at the
  // "snap-pick-votes/$activationId" path so this per-member query uses a
  // server-side index (O(matching_votes)) instead of a full server-side scan
  // of every vote in the activation (O(total_votes)). Add to database rules:
  //   "snap-pick-votes": { "$activationId": { ".indexOn": ["votedBy"] } }
  const snap = await db
    .ref(`snap-pick-votes/${activationId}`)
    .orderByChild("votedBy")
    .equalTo(votedBy)
    .get();

  return snapshotToVotes(snap);
}

// Returns the single open (not-yet-closed) activation for a snap pick, if any.
export async function getOpenActivation(
  snapPickId: string,
): Promise<SnapPickActivation | undefined> {
  const activations = await getSnapPickActivations(snapPickId);
  return activations.find((activation) => activation.closedAt === undefined);
}

// Lazily closes the open activation if its deadline has passed: computes the
// winner from the votes cast so far, persists closedAt + winnerId, and returns
// the now-closed activation. If the open activation is still within its window,
// it is returned unchanged. If there is no open activation, returns undefined.
// This is the MVP auto-close — no background job; the first post-deadline read
// performs the close.
export async function resolveActiveActivation(
  snapPickId: string,
  now: Date = new Date(),
): Promise<SnapPickActivation | undefined> {
  const open = await getOpenActivation(snapPickId);
  if (!open) return undefined;

  if (now.getTime() < open.closesAt.getTime()) return open;

  const [votes, options] = await Promise.all([
    getSnapPickVotes(open.id),
    getSnapPickOptions(snapPickId, true),
  ]);
  const winnerId = computeSnapPickWinner(
    votes,
    options.map((option) => option.id),
  );

  await closeSnapPickActivation(snapPickId, open.id, {
    closedAt: now,
    winnerId,
  });

  return { ...open, closedAt: now, winnerId };
}
