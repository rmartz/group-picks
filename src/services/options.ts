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

export async function joinOptionOwner(
  groupId: string,
  categoryId: string,
  pickId: string,
  optionId: string,
): Promise<void> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/picks/${pickId}/options/${optionId}/owners`,
    { method: "POST" },
  );
  if (!response.ok) throw new Error("Failed to join option");
}

export async function unjoinOptionOwner(
  groupId: string,
  categoryId: string,
  pickId: string,
  optionId: string,
): Promise<{ deleted: boolean }> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/picks/${pickId}/options/${optionId}/owners`,
    { method: "DELETE" },
  );
  if (!response.ok) throw new Error("Failed to unjoin option");

  return response.json() as Promise<{ deleted: boolean }>;
}
