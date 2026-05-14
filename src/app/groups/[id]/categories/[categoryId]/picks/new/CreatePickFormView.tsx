"use client";

import { CREATE_PICK_COPY } from "./copy";

interface CreatePickFormViewProps {
  title: string;
  onTitleChange: (title: string) => void;
  topCount: number;
  onTopCountChange: (topCount: number) => void;
  dueDate: string;
  onDueDateChange: (dueDate: string) => void;
  hasPriorPicks: boolean;
  onSubmit: (e: React.SyntheticEvent) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | undefined;
}

export function CreatePickFormView({
  title,
  onTitleChange,
  topCount,
  onTopCountChange,
  dueDate,
  onDueDateChange,
  hasPriorPicks,
  onSubmit,
  onCancel,
  loading,
  error,
}: CreatePickFormViewProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{CREATE_PICK_COPY.title}</h2>

      {hasPriorPicks && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
          <p className="font-medium text-amber-800">
            {CREATE_PICK_COPY.priorPicksBannerTitle}
          </p>
          <p className="text-amber-700">
            {CREATE_PICK_COPY.priorPicksBannerBody}
          </p>
        </div>
      )}

      <form
        aria-label={CREATE_PICK_COPY.title}
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <div className="space-y-1">
          <label htmlFor="pick-title" className="block text-sm font-medium">
            {CREATE_PICK_COPY.titleLabel}
          </label>
          <input
            id="pick-title"
            type="text"
            value={title}
            onChange={(e) => {
              onTitleChange(e.target.value);
            }}
            placeholder={CREATE_PICK_COPY.titlePlaceholder}
            disabled={loading}
            className="w-full rounded-md border px-3 py-2 text-sm disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="pick-top-count" className="block text-sm font-medium">
            {CREATE_PICK_COPY.topCountLabel}
          </label>
          <input
            id="pick-top-count"
            type="number"
            min={1}
            value={topCount}
            onChange={(e) => {
              onTopCountChange(Number(e.target.value));
            }}
            placeholder={CREATE_PICK_COPY.topCountPlaceholder}
            disabled={loading}
            className="w-full rounded-md border px-3 py-2 text-sm disabled:opacity-50"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="pick-due-date" className="block text-sm font-medium">
            {CREATE_PICK_COPY.dueDateLabel}
          </label>
          <input
            id="pick-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => {
              onDueDateChange(e.target.value);
            }}
            disabled={loading}
            className="w-full rounded-md border px-3 py-2 text-sm disabled:opacity-50"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {CREATE_PICK_COPY.submitButton}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50"
          >
            {CREATE_PICK_COPY.cancelButton}
          </button>
        </div>
      </form>
    </div>
  );
}
