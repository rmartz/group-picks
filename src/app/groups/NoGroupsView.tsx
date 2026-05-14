import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GROUP_LIST_COPY } from "./copy";

export function NoGroupsView() {
  return (
    <div className="flex flex-col items-center gap-4 py-12 text-center">
      <h2 className="text-xl font-semibold">{GROUP_LIST_COPY.emptyHeadline}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {GROUP_LIST_COPY.emptyBody}
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button render={<Link href="/groups/new" />}>
          {GROUP_LIST_COPY.emptyCreateButton}
        </Button>
        <Button variant="outline" disabled>
          {GROUP_LIST_COPY.emptyJoinButton}
        </Button>
      </div>
    </div>
  );
}
