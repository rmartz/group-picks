import type { PickOption } from "@/lib/types/option";

export interface FirebaseOptionPublic {
  name: string;
  creatorId: string;
  owners: Record<string, true>;
  createdAt: number;
  interestedCount?: number;
}

export function optionToFirebase(
  option: Pick<PickOption, "name" | "creatorId" | "owners" | "createdAt">,
): FirebaseOptionPublic {
  const owners: Record<string, true> = {};
  for (const uid of option.owners) {
    owners[uid] = true;
  }
  return {
    name: option.name,
    creatorId: option.creatorId,
    owners,
    createdAt: option.createdAt.getTime(),
  };
}

export function firebaseToOption(
  id: string,
  categoryId: string,
  pickId: string,
  data: FirebaseOptionPublic,
): PickOption {
  return {
    id,
    name: data.name,
    creatorId: data.creatorId,
    owners: Object.keys(data.owners),
    createdAt: new Date(data.createdAt),
    pickId,
    categoryId,
    interestedCount: data.interestedCount ?? 0,
  };
}
