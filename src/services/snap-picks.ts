import type { SnapPickDurationChoice } from "@/lib/snap-pick-activation";
import type { SnapPickOption } from "@/lib/types/snap-pick";

interface WireSnapPickOption {
  id: string;
  title: string;
  addedBy: string;
  addedAt: string;
  removedAt?: string;
}

function wireToSnapPickOption(wire: WireSnapPickOption): SnapPickOption {
  return {
    id: wire.id,
    title: wire.title,
    addedBy: wire.addedBy,
    addedAt: new Date(wire.addedAt),
    removedAt:
      wire.removedAt !== undefined ? new Date(wire.removedAt) : undefined,
  };
}

export async function createSnapPick(
  groupId: string,
  categoryId: string,
  title: string,
): Promise<{ snapPickId: string; createdAt: Date }> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/snap-picks`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    },
  );
  if (!response.ok) throw new Error("Failed to create snap pick");
  const data = (await response.json()) as {
    snapPickId: string;
    createdAt: string;
  };
  return { snapPickId: data.snapPickId, createdAt: new Date(data.createdAt) };
}

export async function getSnapPickOptions(
  groupId: string,
  categoryId: string,
  snapPickId: string,
): Promise<SnapPickOption[]> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/snap-picks/${snapPickId}/options`,
  );
  if (!response.ok) throw new Error("Failed to fetch snap pick options");
  const data = (await response.json()) as { options: WireSnapPickOption[] };
  return data.options.map(wireToSnapPickOption);
}

export async function addSnapPickOption(
  groupId: string,
  categoryId: string,
  snapPickId: string,
  title: string,
): Promise<{ optionId: string; addedAt: Date }> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/snap-picks/${snapPickId}/options`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    },
  );
  if (!response.ok) throw new Error("Failed to add snap pick option");
  const data = (await response.json()) as { optionId: string; addedAt: string };
  return { optionId: data.optionId, addedAt: new Date(data.addedAt) };
}

export async function removeSnapPickOption(
  groupId: string,
  categoryId: string,
  snapPickId: string,
  optionId: string,
): Promise<void> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/snap-picks/${snapPickId}/options/${optionId}`,
    { method: "DELETE" },
  );
  if (!response.ok) throw new Error("Failed to remove snap pick option");
}

export async function activateSnapPick(
  groupId: string,
  categoryId: string,
  snapPickId: string,
  duration: SnapPickDurationChoice,
): Promise<{ activationId: string; closesAt: Date }> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/snap-picks/${snapPickId}/activate`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration }),
    },
  );
  if (!response.ok) throw new Error("Failed to activate snap pick");
  const data = (await response.json()) as {
    activationId: string;
    closesAt: string;
  };
  return { activationId: data.activationId, closesAt: new Date(data.closesAt) };
}

export async function recordSnapPickVote(
  groupId: string,
  categoryId: string,
  snapPickId: string,
  activationId: string,
  vote: { winnerId: string; loserId: string },
): Promise<{ voteId: string; votedAt: Date }> {
  const response = await fetch(
    `/api/groups/${groupId}/categories/${categoryId}/snap-picks/${snapPickId}/activations/${activationId}/vote`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(vote),
    },
  );
  if (!response.ok) throw new Error("Failed to record snap pick vote");
  const data = (await response.json()) as { voteId: string; votedAt: string };
  return { voteId: data.voteId, votedAt: new Date(data.votedAt) };
}
