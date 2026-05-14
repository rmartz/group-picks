import Link from "next/link";

import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";

import { CATEGORY_COPY } from "./copy";
import { CreateCategoryFormView } from "./CreateCategoryFormView";
import { EditCategoryFormView } from "./EditCategoryFormView";

export interface CategoryListViewProps {
  categories: Category[];
  groupId: string;
  currentUserId: string;
  showCreateForm: boolean;
  editingId: string | undefined;
  createName: string;
  createDescription: string;
  editName: string;
  editDescription: string;
  loading: boolean;
  error: string | undefined;
  picksByCategory: Record<string, GroupPick[]>;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onStartEdit: (category: Category) => void;
  onCancelEdit: () => void;
  onCreateNameChange: (name: string) => void;
  onCreateDescriptionChange: (description: string) => void;
  onEditNameChange: (name: string) => void;
  onEditDescriptionChange: (description: string) => void;
  onCreateSubmit: (e: React.SyntheticEvent) => void;
  onEditSubmit: (e: React.SyntheticEvent) => void;
}

export function CategoryListView({
  categories,
  groupId,
  currentUserId,
  showCreateForm,
  editingId,
  createName,
  createDescription,
  editName,
  editDescription,
  loading,
  error,
  picksByCategory,
  onStartCreate,
  onCancelCreate,
  onStartEdit,
  onCancelEdit,
  onCreateNameChange,
  onCreateDescriptionChange,
  onEditNameChange,
  onEditDescriptionChange,
  onCreateSubmit,
  onEditSubmit,
}: CategoryListViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {CATEGORY_COPY.categoriesHeading}
        </h2>
        {!showCreateForm && (
          <button
            onClick={onStartCreate}
            disabled={loading}
            className="rounded bg-black px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {CATEGORY_COPY.addCategoryButton}
          </button>
        )}
      </div>

      {showCreateForm && (
        <div className="rounded border p-4">
          <CreateCategoryFormView
            name={createName}
            description={createDescription}
            onNameChange={onCreateNameChange}
            onDescriptionChange={onCreateDescriptionChange}
            onSubmit={onCreateSubmit}
            onCancel={onCancelCreate}
            loading={loading}
            error={error}
          />
        </div>
      )}

      {categories.length === 0 && !showCreateForm && (
        <p className="text-sm text-gray-500">
          {CATEGORY_COPY.noCategoriesMessage}
        </p>
      )}

      <ul className="space-y-3">
        {categories.map((category) => {
          const picks = picksByCategory[category.id] ?? [];
          const categoryHref = `/groups/${groupId}/categories/${category.id}`;
          return (
            <li key={category.id} className="rounded border p-4">
              {editingId === category.id ? (
                <EditCategoryFormView
                  name={editName}
                  description={editDescription}
                  onNameChange={onEditNameChange}
                  onDescriptionChange={onEditDescriptionChange}
                  onSubmit={onEditSubmit}
                  onCancel={onCancelEdit}
                  loading={loading}
                  error={error}
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <Link
                        href={categoryHref}
                        className="font-medium hover:underline"
                      >
                        {category.name}
                      </Link>
                      {category.description && (
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      )}
                    </div>
                    {category.creatorId === currentUserId && (
                      <button
                        onClick={() => {
                          onStartEdit(category);
                        }}
                        disabled={loading}
                        className="shrink-0 rounded border px-3 py-1 text-sm font-medium disabled:opacity-50"
                      >
                        {CATEGORY_COPY.editButton}
                      </button>
                    )}
                  </div>
                  {picks.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      {CATEGORY_COPY.noPicksMessage}
                    </p>
                  ) : (
                    <ul className="space-y-1">
                      {picks.map((pick) => (
                        <li key={pick.id}>
                          <Link
                            href={`/groups/${groupId}/categories/${category.id}/picks/${pick.id}`}
                            className="block rounded px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            {pick.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link
                    href={`/groups/${groupId}/categories/${category.id}/picks/new`}
                    className="inline-block rounded bg-black px-3 py-1.5 text-xs font-medium text-white"
                  >
                    {CATEGORY_COPY.createPickButton}
                  </Link>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
