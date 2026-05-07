import type { Category } from "@/lib/types/category";
import { PickStatus, type GroupPick } from "@/lib/types/pick";
import { PickStatusChip } from "@/components/PickStatusChip";
import { CATEGORY_DETAIL_COPY } from "./copy";

interface CategoryDetailViewProps {
  category: Category;
  picks: GroupPick[];
}

export function CategoryDetailView({
  category,
  picks,
}: CategoryDetailViewProps) {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{category.name}</h1>
        {category.description?.trim() && (
          <p className="text-sm text-muted-foreground">
            {category.description}
          </p>
        )}
      </div>
      <section className="space-y-3">
        <h2 className="text-lg font-medium">
          {CATEGORY_DETAIL_COPY.picksLabel}
        </h2>
        {picks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {CATEGORY_DETAIL_COPY.noPicksMessage}
          </p>
        ) : (
          <ul className="space-y-2">
            {picks.map((pick) => (
              <li key={pick.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{pick.title}</p>
                  <PickStatusChip status={pick.status} />
                </div>
                {pick.description?.trim() && (
                  <p className="text-muted-foreground">{pick.description}</p>
                )}
                {pick.dueDate && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pick.status === PickStatus.Open
                      ? CATEGORY_DETAIL_COPY.closesPrefix
                      : CATEGORY_DETAIL_COPY.closedPrefix}{" "}
                    {pick.dueDate.toLocaleDateString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
