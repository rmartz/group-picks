import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { GroupWithActivity } from "@/lib/types/groupActivity";

import { GROUP_LIST_COPY } from "./copy";
import { NoGroupsView } from "./NoGroupsView";

interface GroupListViewProps {
  groups: GroupWithActivity[];
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
                  <div className="flex items-center gap-2">
                    {group.unreadCount > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-xs text-primary-foreground">
                        {group.unreadCount}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {group.memberIds.length}{" "}
                      {group.memberIds.length === 1
                        ? GROUP_LIST_COPY.memberSingular
                        : GROUP_LIST_COPY.memberPlural}
                    </span>
                  </div>
                </div>
                {group.activityPreview !== undefined && (
                  <p className="mt-1 truncate text-sm text-muted-foreground">
                    {group.activityPreview}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
