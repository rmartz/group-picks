import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";
import { CATEGORY_DETAIL_COPY } from "./copy";
import { ReopenPickButton } from "./ReopenPickButton";

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
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{pick.title}</p>
                  {pick.closedAt !== undefined && (
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {CATEGORY_DETAIL_COPY.closedBadge}
                    </span>
                  )}
                </div>
                {pick.description?.trim() && (
                  <p className="text-muted-foreground">{pick.description}</p>
                )}
                {pick.closedAt !== undefined && (
                  <div className="mt-2">
                    <ReopenPickButton
                      groupId={category.groupId}
                      categoryId={category.id}
                      pickId={pick.id}
                    />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
