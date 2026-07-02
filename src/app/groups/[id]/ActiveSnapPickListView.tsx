import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

import { ACTIVE_SNAP_PICK_LIST_COPY } from "./ActiveSnapPickList.copy";

export interface ActiveSnapPickListItem {
  activationId: string;
  title: string;
  categoryName: string | undefined;
  timeRemainingLabel: string;
  href: string;
}

interface ActiveSnapPickListViewProps {
  items: ActiveSnapPickListItem[];
}

export function ActiveSnapPickListView({ items }: ActiveSnapPickListViewProps) {
  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {ACTIVE_SNAP_PICK_LIST_COPY.heading}
      </p>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.activationId}
            className="flex items-center justify-between gap-2 rounded-md border p-3"
          >
            <div className="min-w-0 space-y-0.5">
              <p className="truncate font-medium">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.categoryName
                  ? `${item.categoryName} · ${item.timeRemainingLabel}`
                  : item.timeRemainingLabel}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Badge variant="default">
                {ACTIVE_SNAP_PICK_LIST_COPY.closingSoonLabel}
              </Badge>
              <Link href={item.href} className={buttonVariants({ size: "sm" })}>
                {ACTIVE_SNAP_PICK_LIST_COPY.voteNowButton}
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
