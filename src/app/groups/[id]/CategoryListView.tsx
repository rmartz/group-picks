import type { Category } from "@/lib/types/category";

import { CATEGORY_LIST_COPY } from "./copy";

interface CategoryListViewProps {
  categories: Category[];
  onDeleteCategory: (categoryId: string) => void;
  deletingId: string | undefined;
  deleteError: string | undefined;
  newCategoryName: string;
  onNewCategoryNameChange: (name: string) => void;
  onAddCategory: (e: React.SyntheticEvent) => void;
  adding: boolean;
  addError: string | undefined;
}

export function CategoryListView({
  categories,
  onDeleteCategory,
  deletingId,
  deleteError,
  newCategoryName,
  onNewCategoryNameChange,
  onAddCategory,
  adding,
  addError,
}: CategoryListViewProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">{CATEGORY_LIST_COPY.title}</h2>
      {categories.length === 0 ? (
        <p className="text-sm text-zinc-500">{CATEGORY_LIST_COPY.empty}</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((category) => (
            <li
              key={category.id}
              className="flex items-center justify-between rounded border px-3 py-2 text-sm"
            >
              <span>{category.name}</span>
              <button
                type="button"
                aria-label={`${CATEGORY_LIST_COPY.deleteButton} ${category.name}`}
                onClick={() => {
                  onDeleteCategory(category.id);
                }}
                disabled={deletingId !== undefined}
                className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
              >
                {deletingId === category.id
                  ? CATEGORY_LIST_COPY.deletingButton
                  : CATEGORY_LIST_COPY.deleteButton}
              </button>
            </li>
          ))}
        </ul>
      )}
      {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}
      <form
        aria-label={CATEGORY_LIST_COPY.title}
        onSubmit={onAddCategory}
        className="flex gap-2"
      >
        <input
          type="text"
          aria-label={CATEGORY_LIST_COPY.addCategoryLabel}
          value={newCategoryName}
          onChange={(e) => {
            onNewCategoryNameChange(e.target.value);
          }}
          placeholder={CATEGORY_LIST_COPY.addCategoryPlaceholder}
          className="flex-1 rounded border px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={adding}
          className="rounded bg-black px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {adding
            ? CATEGORY_LIST_COPY.addingButton
            : CATEGORY_LIST_COPY.addButton}
        </button>
      </form>
      {addError && <p className="text-sm text-red-600">{addError}</p>}
    </section>
  );
}
