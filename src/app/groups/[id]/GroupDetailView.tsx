import Link from "next/link";
import type { Group } from "@/lib/types/group";
import { GROUP_DETAIL_COPY } from "./copy";

interface GroupDetailViewProps {
  group: Group;
}

export function GroupDetailView({ group }: GroupDetailViewProps) {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{group.name}</h1>
      <dl className="space-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="font-medium">{GROUP_DETAIL_COPY.createdAtLabel}:</dt>
          <dd>{group.createdAt.toLocaleDateString()}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium">{GROUP_DETAIL_COPY.membersLabel}:</dt>
          <dd>{group.memberIds.length}</dd>
        </div>
      </dl>
      <Link
        href={`/groups/${group.id}/categories/new`}
        className="inline-block rounded bg-black px-4 py-2 text-sm font-medium text-white"
      >
        {GROUP_DETAIL_COPY.createCategoryButton}
      </Link>
    </main>
  );
}
