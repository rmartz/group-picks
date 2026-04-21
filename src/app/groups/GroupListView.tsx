import Link from "next/link";
import type { Group } from "@/lib/types/group";
import { GROUP_LIST_COPY } from "./copy";

interface GroupListViewProps {
  groups: Group[];
}

export function GroupListView({ groups }: GroupListViewProps) {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{GROUP_LIST_COPY.title}</h1>
        <Link
          href="/groups/new"
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white"
        >
          {GROUP_LIST_COPY.newGroupButton}
        </Link>
      </div>
      {groups.length === 0 ? (
        <p className="text-sm text-zinc-500">{GROUP_LIST_COPY.emptyState}</p>
      ) : (
        <ul className="space-y-2">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/groups/${group.id}`}
                className="block rounded border px-4 py-3 text-sm hover:bg-zinc-50"
              >
                <span className="font-medium">{group.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
