import type { Category } from "@/lib/types/category";
import { CATEGORY_COPY } from "./copy";

interface CreatePickFormViewProps {
  categories: Category[];
  categoryId: string;
  name: string;
  description: string;
  topCount: string;
  dueDate: string;
  loading: boolean;
  error: string | undefined;
  onCategoryChange: (categoryId: string) => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onTopCountChange: (topCount: string) => void;
  onDueDateChange: (dueDate: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  onCancel: () => void;
}

export function CreatePickFormView({
  categories,
  categoryId,
  name,
  description,
  topCount,
  dueDate,
  loading,
  error,
  onCategoryChange,
  onNameChange,
  onDescriptionChange,
  onTopCountChange,
  onDueDateChange,
  onSubmit,
  onCancel,
}: CreatePickFormViewProps) {
  return (
    <form
      aria-label={CATEGORY_COPY.createPickForm.title}
      onSubmit={onSubmit}
      className="space-y-3"
    >
      <div className="space-y-1">
        <label htmlFor="create-pick-category" className="text-sm font-medium">
          {CATEGORY_COPY.createPickForm.categoryLabel}
        </label>
        <select
          id="create-pick-category"
          required
          disabled={loading}
          value={categoryId}
          onChange={(e) => {
            onCategoryChange(e.target.value);
          }}
          className="w-full rounded border px-3 py-2 text-sm"
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="create-pick-name" className="text-sm font-medium">
          {CATEGORY_COPY.createPickForm.nameLabel}
        </label>
        <input
          id="create-pick-name"
          type="text"
          required
          value={name}
          onChange={(e) => {
            onNameChange(e.target.value);
          }}
          placeholder={CATEGORY_COPY.createPickForm.namePlaceholder}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="create-pick-description"
          className="text-sm font-medium"
        >
          {CATEGORY_COPY.createPickForm.descriptionLabel}
        </label>
        <textarea
          id="create-pick-description"
          value={description}
          onChange={(e) => {
            onDescriptionChange(e.target.value);
          }}
          placeholder={CATEGORY_COPY.createPickForm.descriptionPlaceholder}
          rows={3}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="create-pick-top-count" className="text-sm font-medium">
          {CATEGORY_COPY.createPickForm.topCountLabel}
        </label>
        <input
          id="create-pick-top-count"
          type="number"
          min={1}
          required
          value={topCount}
          onChange={(e) => {
            onTopCountChange(e.target.value);
          }}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="create-pick-due-date" className="text-sm font-medium">
          {CATEGORY_COPY.createPickForm.dueDateLabel}
        </label>
        <input
          id="create-pick-due-date"
          type="date"
          value={dueDate}
          onChange={(e) => {
            onDueDateChange(e.target.value);
          }}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {CATEGORY_COPY.createPickForm.submitButton}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {CATEGORY_COPY.createPickForm.cancelButton}
        </button>
      </div>
    </form>
  );
}
