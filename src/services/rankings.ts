import type { RankingTier } from "@/lib/types/ranking";

export async function saveRankings(
  groupId: string,
  categoryId: string,
  pickId: string,
  assignments: Record<string, RankingTier>,
): Promise<void> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/picks/${pickId}/rankings`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignments }),
    },
  );
  if (!response.ok) throw new Error("Failed to save rankings");
}
