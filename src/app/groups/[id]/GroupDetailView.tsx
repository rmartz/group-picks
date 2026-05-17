import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/lib/types/category";
import type { Group } from "@/lib/types/group";
import type { GroupPick } from "@/lib/types/pick";

import { CategoryList } from "./categories/CategoryList";
import { GROUP_DETAIL_COPY } from "./copy";
import { InviteSection } from "./InviteSection";
import { LeaveGroupButtonView } from "./LeaveGroupButtonView";

interface MemberName {
  uid: string;
  name: string;
}

interface GroupDetailViewProps {
  group: Group;
  categories: Category[];
  currentUserId: string;
  onLeave: () => void;
  isLeaving?: boolean;
  leaveError?: string;
  initialInviteExpiresAt?: string;
  memberNames: MemberName[];
  picksByCategory: Record<string, GroupPick[]>;
}

interface PickListItemProps {
  pick: GroupPick;
  category: Category | undefined;
  groupId: string;
  variant: "open" | "closed";
}

function PickListItem({ pick, category, groupId, variant }: PickListItemProps) {
  return (
    <li>
      <Link
        href={`/groups/${groupId}/categories/${pick.categoryId}/picks/${pick.id}`}
        className="block rounded-md border p-3 hover:bg-zinc-50"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <p className="font-medium">{pick.title}</p>
            <p className="text-xs text-muted-foreground">
              {category?.name}
              {variant === "open" && pick.dueDate
                ? ` · ${pick.dueDate.toLocaleDateString()}`
                : variant === "closed" && pick.closedAt
                  ? ` · closed ${pick.closedAt.toLocaleDateString()}`
                  : null}
            </p>
          </div>
          <Badge variant={variant === "open" ? "default" : "secondary"}>
            {variant === "open"
              ? GROUP_DETAIL_COPY.openBadge
              : GROUP_DETAIL_COPY.closedBadge}
          </Badge>
        </div>
      </Link>
    </li>
  );
}

export function GroupDetailView({
  group,
  categories,
  currentUserId,
  onLeave,
  isLeaving = false,
  leaveError,
  initialInviteExpiresAt,
  memberNames,
  picksByCategory,
}: GroupDetailViewProps) {
  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));
  const allPicks = categories.flatMap((c) => picksByCategory[c.id] ?? []);
  const openPicks = allPicks.filter((p) => p.closedAt === undefined);
  const closedPicks = allPicks.filter((p) => p.closedAt !== undefined);

  return (
    <main className="mx-auto max-w-lg space-y-4 p-6">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-semibold">{group.name}</h1>
        <p className="text-sm text-muted-foreground">
          {group.memberIds.length} {GROUP_DETAIL_COPY.membersLabel}
        </p>
      </div>

      <Tabs defaultValue="picks">
        <TabsList variant="line">
          <TabsTrigger value="picks">
            {GROUP_DETAIL_COPY.tabs.picks}
          </TabsTrigger>
          <TabsTrigger value="categories">
            {GROUP_DETAIL_COPY.tabs.categories}
          </TabsTrigger>
          <TabsTrigger value="members">
            {GROUP_DETAIL_COPY.tabs.members}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="picks" className="mt-4 space-y-6">
          {allPicks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {GROUP_DETAIL_COPY.noPicksMessage}
            </p>
          ) : (
            <>
              {openPicks.length > 0 && (
                <section className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {GROUP_DETAIL_COPY.openSection}
                  </p>
                  <ul className="space-y-2">
                    {openPicks.map((pick) => (
                      <PickListItem
                        key={pick.id}
                        pick={pick}
                        category={categoryById[pick.categoryId]}
                        groupId={group.id}
                        variant="open"
                      />
                    ))}
                  </ul>
                </section>
              )}
              {closedPicks.length > 0 && (
                <section className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {GROUP_DETAIL_COPY.closedSection}
                  </p>
                  <ul className="space-y-2">
                    {closedPicks.map((pick) => (
                      <PickListItem
                        key={pick.id}
                        pick={pick}
                        category={categoryById[pick.categoryId]}
                        groupId={group.id}
                        variant="closed"
                      />
                    ))}
                  </ul>
                </section>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <CategoryList
            groupId={group.id}
            initialCategories={categories}
            currentUserId={currentUserId}
            initialPicksByCategory={picksByCategory}
          />
        </TabsContent>

        <TabsContent value="members" className="mt-4 space-y-6" keepMounted>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">
              {GROUP_DETAIL_COPY.membersHeading}
            </h2>
            <ul className="space-y-1">
              {memberNames.map((m) => (
                <li key={m.uid} className="text-sm">
                  {m.name}
                </li>
              ))}
            </ul>
          </section>
          <InviteSection
            groupId={group.id}
            initialToken={group.inviteToken}
            initialExpiresAt={initialInviteExpiresAt}
          />
          <LeaveGroupButtonView
            onLeave={onLeave}
            isLeaving={isLeaving}
            error={leaveError}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
