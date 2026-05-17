import Link from "next/link";

import { Button } from "@/components/ui/button";

import { GROUP_LIST_COPY } from "./copy";

export function NoGroupsView() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <div className="flex w-full flex-col items-center gap-3 rounded-lg border border-dashed p-8">
        <span className="text-4xl" aria-hidden="true">
          🙌
        </span>
        <div className="space-y-1">
          <h2 className="font-semibold">{GROUP_LIST_COPY.emptyHeadline}</h2>
          <p className="text-sm italic text-muted-foreground">
            {GROUP_LIST_COPY.emptyBody}
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2">
        <Button className="w-full" render={<Link href="/groups/new" />}>
          {GROUP_LIST_COPY.emptyCreateButton}
        </Button>
        <Button variant="outline" className="w-full" disabled>
          {GROUP_LIST_COPY.emptyJoinButton}
        </Button>
      </div>
    </div>
  );
}
