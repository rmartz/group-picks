import type { Category } from "@/lib/types/category";
import { CreateCategoryFormView } from "./CreateCategoryFormView";
import { CreatePickFormView } from "./CreatePickFormView";
import { EditCategoryFormView } from "./EditCategoryFormView";
import { CATEGORY_COPY } from "./copy";

export interface CategoryListViewProps {
  categories: Category[];
  showCreateForm: boolean;
  editingId: string | undefined;
  createName: string;
  createDescription: string;
  editName: string;
  editDescription: string;
  loading: boolean;
  error: string | undefined;
  showCreatePickForCategoryId: string | undefined;
  createPickCategoryId: string;
  createPickName: string;
  createPickDescription: string;
  createPickTopCount: string;
  createPickDueDate: string;
  pickLoading: boolean;
  pickError: string | undefined;
  onStartCreate: () => void;
  onCancelCreate: () => void;
  onStartCreatePick: (categoryId: string) => void;
  onCancelCreatePick: () => void;
  onStartEdit: (category: Category) => void;
  onCancelEdit: () => void;
  onCreateNameChange: (name: string) => void;
  onCreateDescriptionChange: (description: string) => void;
  onEditNameChange: (name: string) => void;
  onEditDescriptionChange: (description: string) => void;
  onCreatePickCategoryChange: (categoryId: string) => void;
  onCreatePickNameChange: (name: string) => void;
  onCreatePickDescriptionChange: (description: string) => void;
  onCreatePickTopCountChange: (topCount: string) => void;
  onCreatePickDueDateChange: (dueDate: string) => void;
  onCreateSubmit: (e: React.SyntheticEvent) => void;
  onEditSubmit: (e: React.SyntheticEvent) => void;
  onCreatePickSubmit: (e: React.SyntheticEvent) => void;
}

export function CategoryListView({
  categories,
  showCreateForm,
  editingId,
  createName,
  createDescription,
  editName,
  editDescription,
  loading,
  error,
  showCreatePickForCategoryId,
  createPickCategoryId,
  createPickName,
  createPickDescription,
  createPickTopCount,
  createPickDueDate,
  pickLoading,
  pickError,
  onStartCreate,
  onCancelCreate,
  onStartCreatePick,
  onCancelCreatePick,
  onStartEdit,
  onCancelEdit,
  onCreateNameChange,
  onCreateDescriptionChange,
  onEditNameChange,
  onEditDescriptionChange,
  onCreatePickCategoryChange,
  onCreatePickNameChange,
  onCreatePickDescriptionChange,
  onCreatePickTopCountChange,
  onCreatePickDueDateChange,
  onCreateSubmit,
  onEditSubmit,
  onCreatePickSubmit,
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
        {categories.map((category) => (
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
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium">{category.name}</p>
                  {category.description && (
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => {
                      onStartCreatePick(category.id);
                    }}
                    disabled={loading || pickLoading}
                    className="rounded border px-3 py-1 text-sm font-medium disabled:opacity-50"
                  >
                    {CATEGORY_COPY.addPickButton}
                  </button>
                  <button
                    onClick={() => {
                      onStartEdit(category);
                    }}
                    disabled={loading}
                    className="rounded border px-3 py-1 text-sm font-medium disabled:opacity-50"
                  >
                    {CATEGORY_COPY.editButton}
                  </button>
                </div>
              </div>
            )}
            {showCreatePickForCategoryId === category.id && (
              <div className="mt-4 rounded border p-4">
                <CreatePickFormView
                  categories={categories}
                  categoryId={createPickCategoryId}
                  name={createPickName}
                  description={createPickDescription}
                  topCount={createPickTopCount}
                  dueDate={createPickDueDate}
                  loading={pickLoading}
                  error={pickError}
                  onCategoryChange={onCreatePickCategoryChange}
                  onNameChange={onCreatePickNameChange}
                  onDescriptionChange={onCreatePickDescriptionChange}
                  onTopCountChange={onCreatePickTopCountChange}
                  onDueDateChange={onCreatePickDueDateChange}
                  onSubmit={onCreatePickSubmit}
                  onCancel={onCancelCreatePick}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
