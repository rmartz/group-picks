import type { Group } from "@/lib/types/group";
import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";
import { GROUP_DETAIL_COPY } from "./copy";
import { CategoryList } from "./categories/CategoryList";
import { PicksByCategory } from "./PicksByCategory";

interface GroupDetailViewProps {
  group: Group;
  categories: Category[];
  picks: GroupPick[];
}

export function GroupDetailView({ group, categories, picks }: GroupDetailViewProps) {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
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
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{GROUP_DETAIL_COPY.picksLabel}</h2>
        {picks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {GROUP_DETAIL_COPY.noPicksMessage}
          </p>
        ) : (
          <PicksByCategory categories={categories} picks={picks} />
        )}
      </section>
      <CategoryList groupId={group.id} initialCategories={categories} />
    </main>
  );
}
