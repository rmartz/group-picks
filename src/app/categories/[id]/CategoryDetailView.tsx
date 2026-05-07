import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";
import { CATEGORY_DETAIL_COPY } from "./copy";
import { PickList } from "./PickList";

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
        <PickList
          groupId={category.groupId}
          categoryId={category.id}
          initialPicks={picks}
        />
      </section>
    </main>
  );
}
