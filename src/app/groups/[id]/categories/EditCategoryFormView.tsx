import { CATEGORY_COPY } from "./copy";

interface EditCategoryFormViewProps {
  name: string;
  description: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | undefined;
}

export function EditCategoryFormView({
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onSubmit,
  onCancel,
  loading,
  error,
}: EditCategoryFormViewProps) {
  return (
    <form
      aria-label={CATEGORY_COPY.editForm.title}
      onSubmit={onSubmit}
      className="space-y-3"
    >
      <div className="space-y-1">
        <label htmlFor="edit-category-name" className="text-sm font-medium">
          {CATEGORY_COPY.editForm.nameLabel}
        </label>
        <input
          id="edit-category-name"
          type="text"
          required
          value={name}
          onChange={(e) => {
            onNameChange(e.target.value);
          }}
          placeholder={CATEGORY_COPY.editForm.namePlaceholder}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-1">
        <label
          htmlFor="edit-category-description"
          className="text-sm font-medium"
        >
          {CATEGORY_COPY.editForm.descriptionLabel}
        </label>
        <textarea
          id="edit-category-description"
          value={description}
          onChange={(e) => {
            onDescriptionChange(e.target.value);
          }}
          placeholder={CATEGORY_COPY.editForm.descriptionPlaceholder}
          rows={3}
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
          {CATEGORY_COPY.editForm.submitButton}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {CATEGORY_COPY.editForm.cancelButton}
        </button>
      </div>
    </form>
  );
}
