import type { Option } from "@/lib/types/option";

export interface ClosedPickResultEntry {
  option: Option;
  rank: number;
  score: number;
}

/**
 * Computes ranked results from option ownership counts.
 * Score = number of users who added the option (ownerIds.length).
 * Ties share the same rank; ranks after a tie skip accordingly.
 * Top picks include all options with rank <= topCount (ties at the boundary expand the list).
 */
export function computePickResults(
  options: readonly Option[],
  topCount: number,
): { topPicks: ClosedPickResultEntry[]; runnersUp: ClosedPickResultEntry[] } {
  if (options.length === 0) {
    return { topPicks: [], runnersUp: [] };
  }

  const scored = [...options].map((option) => ({
    option,
    score: option.ownerIds.length,
  }));

  scored.sort(
    (a, b) => b.score - a.score || a.option.title.localeCompare(b.option.title),
  );

  const ranked: ClosedPickResultEntry[] = [];
  let currentRank = 1;
  for (let i = 0; i < scored.length; i++) {
    const item = scored[i];
    const prevItem = scored[i - 1];
    if (!item) continue;
    if (i > 0 && prevItem && item.score < prevItem.score) {
      currentRank = i + 1;
    }
    ranked.push({ option: item.option, score: item.score, rank: currentRank });
  }

  const topPicks = ranked.filter((entry) => entry.rank <= topCount);
  const runnersUp = ranked.filter((entry) => entry.rank > topCount);

  return { topPicks, runnersUp };
}
