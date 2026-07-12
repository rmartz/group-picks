"use client";

import { useMemo, useState } from "react";

import { relevantMatchups } from "@/lib/snap-pick-pairing";
import type { SnapPickOption, SnapPickRatings } from "@/lib/types/snap-pick";
import { recordSnapPickVote } from "@/services/snap-picks";

import { SNAP_PICK_MATCHUP_COPY } from "./SnapPickMatchup.copy";
import { SnapPickMatchupView } from "./SnapPickMatchupView";

interface SnapPickMatchupProps {
  groupId: string;
  categoryId: string;
  snapPickId: string;
  activationId: string;
  // The active option pool for this run.
  options: SnapPickOption[];
  // Pair keys the current member has already voted on in this activation, so a
  // member who joins mid-run resumes from their own remaining queue.
  votedPairKeys: string[];
  // The member's global preference model, used to prune clearly-low-relevance
  // options from the queue. Absent (or empty) means no history — every option is
  // neutral and the queue is the full round-robin.
  ratings?: SnapPickRatings;
}

export function SnapPickMatchup({
  groupId,
  categoryId,
  snapPickId,
  activationId,
  options,
  votedPairKeys,
  ratings,
}: SnapPickMatchupProps) {
  const byId = useMemo(
    () => new Map(options.map((option) => [option.id, option])),
    [options],
  );
  // The member's remaining queue, seeded once from the pool minus already-cast
  // pairs. total is the member's full share (already-voted plus remaining).
  const queue = useMemo(
    () =>
      relevantMatchups(
        options.map((option) => option.id),
        ratings ?? {},
        votedPairKeys,
      ),
    [options, ratings, votedPairKeys],
  );
  const total = queue.length + votedPairKeys.length;

  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const current = queue[index];
  const left = current !== undefined ? byId.get(current.a) : undefined;
  const right = current !== undefined ? byId.get(current.b) : undefined;
  const completed = votedPairKeys.length + index;

  async function handleChoose(winnerId: string, loserId: string) {
    setError(undefined);
    setLoading(true);
    try {
      await recordSnapPickVote(groupId, categoryId, snapPickId, activationId, {
        winnerId,
        loserId,
      });
      setIndex((prev) => prev + 1);
    } catch {
      setError(SNAP_PICK_MATCHUP_COPY.errorDefault);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SnapPickMatchupView
      left={left}
      right={right}
      completed={completed}
      total={total}
      pool={options}
      loading={loading}
      error={error}
      onChoose={(winnerId, loserId) => void handleChoose(winnerId, loserId)}
    />
  );
}
