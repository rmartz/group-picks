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

function firstNameFromDisplayName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "";
  const atIndex = trimmed.indexOf("@");
  const normalized = atIndex > 0 ? trimmed.slice(0, atIndex) : trimmed;
  const [first] = normalized.split(/\s+/);
  return first ?? normalized;
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
      const memberIdentity: AttributionMember = {
        uid: member.uid,
        firstName: firstNameFromDisplayName(member.name) || member.uid,
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
