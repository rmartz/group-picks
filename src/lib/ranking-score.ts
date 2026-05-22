import type { Option } from "@/lib/types/option";
import { RankingTier } from "@/lib/types/ranking";

const TIER_SCORES: Record<RankingTier, number> = {
  [RankingTier.LoveIt]: 4,
  [RankingTier.Yes]: 3,
  [RankingTier.Maybe]: 2,
  [RankingTier.NotReally]: 1,
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
  [RankingTier.NotReally]: AttributionMember[];
  noRank: AttributionMember[];
}

export function computeTopPicks(
  allRankings: Record<string, Record<string, RankingTier>>,
  options: Option[],
  topCount: number,
): Option[] {
  const scores: Record<string, number> = {};

  for (const userRankings of Object.values(allRankings)) {
    for (const [optionId, tier] of Object.entries(userRankings)) {
      scores[optionId] = (scores[optionId] ?? 0) + TIER_SCORES[tier];
    }
  }

  return [...options]
    .sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
    .slice(0, topCount);
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
      [RankingTier.NotReally]: [],
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
        userTier === RankingTier.NotReally
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
