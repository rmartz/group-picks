import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";

import { CATEGORY_DETAIL_COPY } from "./copy";
import { ReopenPickButton } from "./ReopenPickButton";

interface CategoryDetailViewProps {
  category: Category;
  closePickAction?: (formData: FormData) => void | Promise<void>;
  picks: GroupPick[];
}

export function CategoryDetailView({
  category,
  closePickAction,
  picks,
}: CategoryDetailViewProps) {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{category.name}</h1>
        <dl className="space-y-2 text-sm">
          <div className="flex gap-2">
            <dt className="font-medium">
              {CATEGORY_DETAIL_COPY.createdAtLabel}:
            </dt>
            <dd>{category.createdAt.toLocaleDateString()}</dd>
          </div>
        </dl>
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
                  {pick.closedAt === undefined && closePickAction && (
                    <form action={closePickAction}>
                      <input type="hidden" name="pickId" value={pick.id} />
                      <button className="rounded border px-2.5 py-1 text-xs font-medium">
                        {CATEGORY_DETAIL_COPY.closePickButton}
                      </button>
                    </form>
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
