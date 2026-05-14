import type { Group } from "@/lib/types/group";
import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";
import { GROUP_DETAIL_COPY } from "./copy";
import { InviteSection } from "./InviteSection";
import { LeaveGroupButtonView } from "./LeaveGroupButtonView";
import { CategoryList } from "./categories/CategoryList";

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
  return (
    <main className="mx-auto max-w-lg space-y-8 p-6">
      <h1 className="text-2xl font-semibold">{group.name}</h1>
      <dl className="space-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="font-medium">{GROUP_DETAIL_COPY.createdAtLabel}:</dt>
          <dd>{group.createdAt.toLocaleDateString()}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium">{GROUP_DETAIL_COPY.membersLabel}:</dt>
          <dd>
            <ul className="space-y-1">
              {memberNames.map((m) => (
                <li key={m.uid}>{m.name}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
      <InviteSection
        groupId={group.id}
        initialToken={group.inviteToken}
        initialExpiresAt={initialInviteExpiresAt}
      />
      <CategoryList
        groupId={group.id}
        initialCategories={categories}
        currentUserId={currentUserId}
        initialPicksByCategory={picksByCategory}
      />
      <LeaveGroupButtonView
        onLeave={onLeave}
        isLeaving={isLeaving}
        error={leaveError}
      />
    </main>
  );
}
