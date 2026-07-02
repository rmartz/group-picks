import { NextResponse } from "next/server";

import { pairKey } from "@/lib/snap-pick-pairing";
import {
  getOpenActivation,
  getSnapPickVotes,
  recordSnapPickVote,
} from "@/server/data/snap-pick-activations";
import { getVerifiedUid } from "@/server/utils/auth";
import { authorizeSnapPickMember } from "@/server/utils/snap-pick-auth";

interface RouteParams {
  params: Promise<{
    id: string;
    categoryId: string;
    snapPickId: string;
    activationId: string;
  }>;
}

// A vote body names the option the member preferred and the one they passed over.
function parseVoteBody(
  value: unknown,
): { winnerId: string; loserId: string } | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const winnerId = (value as { winnerId?: unknown }).winnerId;
  const loserId = (value as { loserId?: unknown }).loserId;
  if (typeof winnerId !== "string" || typeof loserId !== "string") {
    return undefined;
  }
  if (!winnerId || !loserId || winnerId === loserId) return undefined;
  return { winnerId, loserId };
}

export async function POST(request: Request, { params }: RouteParams) {
  const uid = await getVerifiedUid();
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: groupId, categoryId, snapPickId, activationId } = await params;
  const denied = await authorizeSnapPickMember(
    uid,
    groupId,
    categoryId,
    snapPickId,
  );
  if (denied) return denied;

  let body: { winnerId: unknown; loserId: unknown };
  try {
    body = (await request.json()) as { winnerId: unknown; loserId: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = parseVoteBody(body);
  if (!parsed) {
    return NextResponse.json(
      { error: "winnerId and loserId are required and must differ" },
      { status: 400 },
    );
  }

  const open = await getOpenActivation(snapPickId);
  if (open?.id !== activationId) {
    return NextResponse.json(
      { error: "No open activation to vote in" },
      { status: 409 },
    );
  }

  // Reject a second vote on the same matchup from the same member: the pair is
  // already decided for them, so accepting another would double-count it.
  const key = pairKey(parsed.winnerId, parsed.loserId);
  const votes = await getSnapPickVotes(activationId);
  const alreadyVoted = votes.some(
    (vote) => vote.votedBy === uid && vote.pairKey === key,
  );
  if (alreadyVoted) {
    return NextResponse.json(
      { error: "You have already voted on this matchup" },
      { status: 409 },
    );
  }

  const { id, votedAt } = await recordSnapPickVote(activationId, {
    winnerId: parsed.winnerId,
    loserId: parsed.loserId,
    votedBy: uid,
  });

  return NextResponse.json(
    { voteId: id, votedAt: votedAt.toISOString(), pairKey: key },
    { status: 201 },
  );
}
