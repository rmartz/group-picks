import type { Category } from "@/lib/types/category";
import { PickStatus, type GroupPick } from "@/lib/types/pick";
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

interface PickStatusChipProps {
  status: PickStatus;
}

function PickStatusChip({ status }: PickStatusChipProps) {
  if (status === PickStatus.Open) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        ● {CATEGORY_DETAIL_COPY.statusOpen}
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
      {CATEGORY_DETAIL_COPY.statusClosed}
    </span>
  );
}
