import type { Group } from "@/lib/types/group";
import type { Category } from "@/lib/types/category";
import { PickStatus, type GroupPick } from "@/lib/types/pick";
import { PickStatusChip } from "@/components/PickStatusChip";
import { GROUP_DETAIL_COPY } from "./copy";
import { CategoryList } from "./categories/CategoryList";

const CLOSED_PICK_BORDER_COLOR = "#cdb8ad";

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

interface PicksByCategoryProps {
  categories: Category[];
  picks: GroupPick[];
}

function PicksByCategory({ categories, picks }: PicksByCategoryProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const picksByCategory = new Map<string, GroupPick[]>();

  for (const pick of picks) {
    const bucket = picksByCategory.get(pick.categoryId) ?? [];
    bucket.push(pick);
    picksByCategory.set(pick.categoryId, bucket);
  }

  return (
    <div className="space-y-4">
      {Array.from(picksByCategory.entries()).map(([categoryId, categoryPicks]) => (
        <div key={categoryId} className="space-y-2">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {categoryMap.get(categoryId) ?? categoryId}
          </h3>
          <ul className="space-y-2">
            {categoryPicks.map((pick) => (
              <li
                key={pick.id}
                className="rounded-md border p-3 text-sm"
                style={{
                  borderLeftWidth: "3px",
                  borderLeftColor:
                    pick.status === PickStatus.Open
                      ? "black"
                      : CLOSED_PICK_BORDER_COLOR,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{pick.title}</p>
                  <PickStatusChip status={pick.status} />
                </div>
                {pick.dueDate && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pick.status === PickStatus.Open
                      ? GROUP_DETAIL_COPY.closesPrefix
                      : GROUP_DETAIL_COPY.closedPrefix}{" "}
                    {pick.dueDate.toLocaleDateString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
