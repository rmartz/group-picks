"use client";

import { CREATE_GROUP_COPY } from "./copy";

interface CreateGroupFormViewProps {
  name: string;
  onNameChange: (name: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  loading: boolean;
  error: string | undefined;
}

export function CreateGroupFormView({
  name,
  onNameChange,
  onSubmit,
  loading,
  error,
}: CreateGroupFormViewProps) {
  return (
    <div className="w-full max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">{CREATE_GROUP_COPY.title}</h1>
      <form
        aria-label={CREATE_GROUP_COPY.title}
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium">
            {CREATE_GROUP_COPY.nameLabel}
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => {
              onNameChange(e.target.value);
            }}
            placeholder={CREATE_GROUP_COPY.namePlaceholder}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {CREATE_GROUP_COPY.submitButton}
        </button>
      </form>
    </div>
  );
}
