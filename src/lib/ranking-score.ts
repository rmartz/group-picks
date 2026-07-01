import type { Option } from "@/lib/types/option";
import { RankingTier } from "@/lib/types/ranking";

export interface ClosedPickResultEntry {
  option: Option;
  rank: number;
  score: number;
}

const TIER_SCORES: Record<RankingTier, number> = {
  [RankingTier.LoveIt]: 4,
  [RankingTier.Yes]: 3,
  [RankingTier.Maybe]: 2,
  [RankingTier.NotForMe]: 1,
  [RankingTier.Unranked]: 0,
};

export interface MemberDisplayName {
  uid: string;
  name: string;
}

export interface AttributionMember {
  uid: string;
  firstName: string;
}

export interface OptionTierAttribution {
  [RankingTier.LoveIt]: AttributionMember[];
  [RankingTier.Yes]: AttributionMember[];
  [RankingTier.Maybe]: AttributionMember[];
  [RankingTier.NotForMe]: AttributionMember[];
  noRank: AttributionMember[];
}

function computeOptionScores(
  allRankings: Record<string, Record<string, RankingTier>>,
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const userRankings of Object.values(allRankings)) {
    for (const [optionId, tier] of Object.entries(userRankings)) {
      scores[optionId] = (scores[optionId] ?? 0) + TIER_SCORES[tier];
    }
  }
  return scores;
}

/**
 * Computes fully-ranked pick results using fixed-weight tier scoring.
 * Each option's score is the sum of its per-voter tier weights (see TIER_SCORES).
 * Ties share the same rank; ranks after a tie skip accordingly.
 * Top picks include all options with rank <= topCount (ties at the boundary expand the list).
 */
export function computeRankedResults(
  allRankings: Record<string, Record<string, RankingTier>>,
  options: Option[],
  topCount: number,
): { topPicks: ClosedPickResultEntry[]; runnersUp: ClosedPickResultEntry[] } {
  if (options.length === 0) {
    return { topPicks: [], runnersUp: [] };
  }

  const scores = computeOptionScores(allRankings);

  const sorted = [...options].sort(
    (a, b) =>
      (scores[b.id] ?? 0) - (scores[a.id] ?? 0) ||
      a.title.localeCompare(b.title),
  );

  const ranked: ClosedPickResultEntry[] = [];
  let currentRank = 1;
  for (const [i, item] of sorted.entries()) {
    const prevItem = sorted[i - 1];
    if (
      i > 0 &&
      prevItem &&
      (scores[item.id] ?? 0) < (scores[prevItem.id] ?? 0)
    ) {
      currentRank = i + 1;
    }
    ranked.push({
      option: item,
      score: scores[item.id] ?? 0,
      rank: currentRank,
    });
  }

  const topPicks = ranked.filter((e) => e.rank <= topCount);
  const runnersUp = ranked.filter((e) => e.rank > topCount);

  return { topPicks, runnersUp };
}

export function computeOptionTierAttribution(
  allRankings: Record<string, Record<string, RankingTier>>,
  options: Option[],
  members: MemberDisplayName[],
): Record<string, OptionTierAttribution> {
  const result: Record<string, OptionTierAttribution> = {};

  for (const option of options) {
    const attribution: OptionTierAttribution = {
      [RankingTier.LoveIt]: [],
      [RankingTier.Yes]: [],
      [RankingTier.Maybe]: [],
      [RankingTier.NotForMe]: [],
      noRank: [],
    };

    for (const member of members) {
      const userTier = allRankings[member.uid]?.[option.id];
      const trimmedName = member.name.trim();
      const atIndex = trimmedName.indexOf("@");
      const normalizedName = !trimmedName
        ? "Unknown"
        : atIndex > 0
          ? trimmedName.slice(0, atIndex)
          : trimmedName;
      const [firstName] = normalizedName.split(/\s+/);
      const resolvedFirstName =
        firstName && firstName.length > 0 ? firstName : normalizedName;
      const memberIdentity: AttributionMember = {
        uid: member.uid,
        firstName: resolvedFirstName,
      };

      if (
        userTier === RankingTier.LoveIt ||
        userTier === RankingTier.Yes ||
        userTier === RankingTier.Maybe ||
        userTier === RankingTier.NotForMe
      ) {
        attribution[userTier].push(memberIdentity);
      } else {
        attribution.noRank.push(memberIdentity);
      }
    }

    result[option.id] = attribution;
  }

  return result;
}
