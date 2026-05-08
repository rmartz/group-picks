import type { UserPickInterests } from "@/lib/types/option";

export async function toggleInterest(
  groupId: string,
  categoryId: string,
  pickId: string,
  optionId: string,
): Promise<{ interested: boolean }> {
  const response = await fetch(
    `/api/groups/${groupId}/picks/${pickId}/interests`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionId, categoryId }),
    },
  );
  if (!response.ok) throw new Error("Failed to toggle interest");

  const data = (await response.json()) as { interested: boolean };
  return data;
}

export async function getUserInterests(
  groupId: string,
  categoryId: string,
  pickId: string,
): Promise<UserPickInterests> {
  const response = await fetch(
    `/api/groups/${groupId}/picks/${pickId}/interests?categoryId=${categoryId}`,
  );
  if (!response.ok) throw new Error("Failed to fetch interests");

  const data = (await response.json()) as { interestedOptionIds: string[] };
  return {
    pickId,
    categoryId,
    interestedOptionIds: data.interestedOptionIds,
  };
}
