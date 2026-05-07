import type { Category } from "@/lib/types/category";
import { PickStatus, type GroupPick } from "@/lib/types/pick";
import { CATEGORY_DETAIL_COPY } from "./copy";

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
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-medium">{pick.title}</p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {pick.status === PickStatus.Closed
                        ? CATEGORY_DETAIL_COPY.closedPickLabel
                        : CATEGORY_DETAIL_COPY.pickOpenLabel}
                    </p>
                  </div>
                  {pick.status !== PickStatus.Closed && closePickAction && (
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
