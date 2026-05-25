import type { RankingMode } from "@/lib/types/pick";

export async function createPick(
  groupId: string,
  categoryId: string,
  title: string,
  description: string | undefined,
  topCount: number,
  dueDate?: string,
  rankingMode?: RankingMode,
): Promise<{ pickId: string; createdAt: Date }> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/picks`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        topCount,
        dueDate,
        rankingMode,
      }),
    },
  );
  if (!response.ok) throw new Error("Failed to create pick");
  const data = (await response.json()) as {
    pickId: string;
    createdAt: string;
  };
  return { pickId: data.pickId, createdAt: new Date(data.createdAt) };
}

export async function reopenPick(
  groupId: string,
  categoryId: string,
  pickId: string,
): Promise<void> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/picks/${pickId}/reopen`,
    { method: "POST" },
  );
  if (!response.ok) throw new Error("Failed to reopen pick");
}
