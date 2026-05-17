import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { Group } from "@/lib/types/group";

import { GROUP_LIST_COPY } from "./copy";
import { NoGroupsView } from "./NoGroupsView";

interface GroupListViewProps {
  groups: Group[];
}

export function GroupListView({ groups }: GroupListViewProps) {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{GROUP_LIST_COPY.title}</h1>
        <Button render={<Link href="/groups/new" />}>
          {GROUP_LIST_COPY.newGroupButton}
        </Button>
      </div>
      {groups.length === 0 ? (
        <NoGroupsView />
      ) : (
        <ul className="space-y-3">
          {groups.map((group) => (
            <li key={group.id}>
              <Link
                href={`/groups/${group.id}`}
                className="block rounded-lg border px-4 py-4 hover:bg-zinc-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{group.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {group.memberIds.length}{" "}
                    {group.memberIds.length === 1
                      ? GROUP_LIST_COPY.memberSingular
                      : GROUP_LIST_COPY.memberPlural}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
