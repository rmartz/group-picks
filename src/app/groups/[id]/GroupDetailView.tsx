import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/lib/types/category";
import type { Group } from "@/lib/types/group";
import { InviteMode } from "@/lib/types/invite";
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
  adminError?: string;
  isLeaving?: boolean;
  leaveError?: string;
  initialInviteExpiresAt?: string;
  initialInviteMode: InviteMode;
  memberNames: MemberName[];
  picksByCategory: Record<string, GroupPick[]>;
  onMakeAdmin?: (uid: string) => void;
  onRevokeAdmin?: (uid: string) => void;
}

interface MemberRowProps {
  member: MemberName;
  group: Group;
  isCurrentUser: boolean;
  isCreator: boolean;
  onMakeAdmin?: (uid: string) => void;
  onRevokeAdmin?: (uid: string) => void;
}

function MemberRow({
  member,
  group,
  isCurrentUser,
  isCreator,
  onMakeAdmin,
  onRevokeAdmin,
}: MemberRowProps) {
  const isMemberAdmin = group.adminIds.includes(member.uid);
  const isMemberCreator = group.creatorId === member.uid;
  const showMenu = isCreator && !isCurrentUser;

  return (
    <li className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <span>{member.name}</span>
        {isMemberCreator && (
          <Badge variant="default" className="text-xs">
            {GROUP_DETAIL_COPY.creatorChip}
          </Badge>
        )}
        {isMemberAdmin && !isMemberCreator && (
          <Badge variant="secondary" className="text-xs">
            {GROUP_DETAIL_COPY.adminChip}
          </Badge>
        )}
      </div>
      {showMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md p-0 text-sm hover:bg-accent"
            data-testid="member-menu-trigger"
          >
            ···
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {isMemberAdmin ? (
              <DropdownMenuItem onClick={() => onRevokeAdmin?.(member.uid)}>
                {GROUP_DETAIL_COPY.revokeAdminAction}
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onMakeAdmin?.(member.uid)}>
                {GROUP_DETAIL_COPY.makeAdminAction}
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  );
}

interface PickListItemProps {
  pick: GroupPick;
  category: Category | undefined;
  groupId: string;
  variant: "open" | "closed";
}

function formatPickSubtitle(
  pick: GroupPick,
  category: Category | undefined,
  variant: "open" | "closed",
): string {
  const parts: string[] = [];
  if (category?.name) parts.push(category.name);
  if (variant === "open" && pick.dueDate) {
    parts.push(pick.dueDate.toLocaleDateString());
  } else if (variant === "closed" && pick.closedAt) {
    parts.push(
      `${GROUP_DETAIL_COPY.closedBadge} ${pick.closedAt.toLocaleDateString()}`,
    );
  }
  return parts.join(" · ");
}

function PickListItem({ pick, category, groupId, variant }: PickListItemProps) {
  const subtitle = formatPickSubtitle(pick, category, variant);

  return (
    <li>
      <Link
        href={`/groups/${groupId}/categories/${pick.categoryId}/picks/${pick.id}`}
        className="block rounded-md border p-3 hover:bg-zinc-50"
      >
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <p className="font-medium">{pick.title}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
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
  adminError,
  isLeaving = false,
  leaveError,
  initialInviteExpiresAt,
  initialInviteMode,
  memberNames,
  picksByCategory,
  onMakeAdmin,
  onRevokeAdmin,
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
          {group.memberIds.length}{" "}
          {group.memberIds.length === 1
            ? GROUP_DETAIL_COPY.memberSingularLabel
            : GROUP_DETAIL_COPY.membersLabel}
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

        {/* keepMounted ensures member names and invite section remain in the
            DOM when the Members tab is inactive, so server-rendered content
            is accessible without requiring a tab interaction */}
        <TabsContent value="members" className="mt-4 space-y-6" keepMounted>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold">
              {GROUP_DETAIL_COPY.membersHeading}
            </h2>
            <ul className="space-y-2">
              {memberNames.map((m) => (
                <MemberRow
                  key={m.uid}
                  member={m}
                  group={group}
                  isCurrentUser={m.uid === currentUserId}
                  isCreator={currentUserId === group.creatorId}
                  onMakeAdmin={onMakeAdmin}
                  onRevokeAdmin={onRevokeAdmin}
                />
              ))}
            </ul>
            {adminError && (
              <p className="text-sm text-destructive">{adminError}</p>
            )}
          </section>
          <InviteSection
            groupId={group.id}
            initialToken={group.inviteToken}
            initialExpiresAt={initialInviteExpiresAt}
            initialMode={initialInviteMode}
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
