import type { PickOption } from "@/lib/types/option";

export async function createOption(
  groupId: string,
  categoryId: string,
  pickId: string,
  name: string,
): Promise<{ optionId: string; createdAt: Date }> {
  const response = await fetch(
    `/api/groups/${groupId}/picks/${pickId}/options`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, categoryId }),
    },
  );
  if (!response.ok) throw new Error("Failed to create option");

  const contentType = response.headers.get("content-type");
  if (response.redirected || !contentType?.includes("application/json")) {
    throw new Error("Failed to create option");
  }

  const data = (await response.json()) as {
    optionId: string;
    createdAt: string;
  };
  return {
    optionId: data.optionId,
    createdAt: new Date(data.createdAt),
  };
}

export async function getOptions(
  groupId: string,
  categoryId: string,
  pickId: string,
): Promise<PickOption[]> {
  const response = await fetch(
    `/api/groups/${groupId}/picks/${pickId}/options?categoryId=${categoryId}`,
  );
  if (!response.ok) throw new Error("Failed to fetch options");

  const data = (await response.json()) as {
    options: (Omit<PickOption, "createdAt"> & { createdAt: string })[];
  };
  return data.options.map((o) => ({
    ...o,
    createdAt: new Date(o.createdAt),
  }));
}
