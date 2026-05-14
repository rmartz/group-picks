import type { Category } from "@/lib/types/category";

import { CATEGORY_DETAIL_COPY } from "./copy";

interface CategoryDetailViewProps {
  category: Category;
}

export function CategoryDetailView({ category }: CategoryDetailViewProps) {
  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <h1 className="text-2xl font-semibold">{category.name}</h1>
      <dl className="space-y-2 text-sm">
        <div className="flex gap-2">
          <dt className="font-medium">
            {CATEGORY_DETAIL_COPY.createdAtLabel}:
          </dt>
          <dd>{category.createdAt.toLocaleDateString()}</dd>
        </div>
      </dl>
    </main>
  );
}
