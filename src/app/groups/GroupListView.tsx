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
          {groups.map((group) => {
            const unreadCount = group.unreadCount ?? 0;
            return (
              <li key={group.id}>
                <Link
                  href={`/groups/${group.id}`}
                  className="block rounded-lg border px-4 py-4 hover:bg-zinc-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{group.name}</span>
                      {unreadCount > 0 && (
                        <span
                          className="inline-flex min-w-5 items-center justify-center rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-semibold text-background"
                          aria-label={`${String(unreadCount)} unread updates`}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {group.memberIds.length}{" "}
                      {group.memberIds.length === 1
                        ? GROUP_LIST_COPY.memberSingular
                        : GROUP_LIST_COPY.memberPlural}
                    </span>
                  </div>
                  {group.lastActivity && (
                    <span className="mt-1 block truncate text-sm text-muted-foreground">
                      {group.lastActivity}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
