import type { Group } from "@/lib/types/group";
import type { Category } from "@/lib/types/category";
import { GROUP_DETAIL_COPY } from "./copy";
import { LeaveGroupButton } from "./LeaveGroupButton";
import { CategoryList } from "./categories/CategoryList";

interface GroupDetailViewProps {
  group: Group;
  categories: Category[];
  currentUserId: string;
}

export function GroupDetailView({
  group,
  categories,
  currentUserId,
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
          <dd>{group.memberIds.length}</dd>
        </div>
      </dl>
      <CategoryList
        groupId={group.id}
        initialCategories={categories}
        currentUserId={currentUserId}
      />
      <LeaveGroupButton groupId={group.id} />
    </main>
  );
}
