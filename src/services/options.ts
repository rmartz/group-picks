import type { Option } from "@/lib/types/option";

interface GetOptionsResponse {
  options: Option[];
  suggestions: Option[];
}

export async function getOptions(
  groupId: string,
  categoryId: string,
  pickId: string,
): Promise<GetOptionsResponse> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/picks/${pickId}/options`,
  );
  if (!response.ok) throw new Error("Failed to fetch options");

  return response.json() as Promise<GetOptionsResponse>;
}

export async function adoptOption(
  groupId: string,
  categoryId: string,
  pickId: string,
  title: string,
): Promise<{ optionId: string }> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/picks/${pickId}/options`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    },
  );
  if (!response.ok) throw new Error("Failed to adopt option");

  return response.json() as Promise<{ optionId: string }>;
}
