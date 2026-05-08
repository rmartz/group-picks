"use client";

import { CATEGORY_DETAIL_COPY } from "./copy";

interface ReopenPickButtonViewProps {
  onReopen: () => void;
  isReopening: boolean;
  error: string | undefined;
}

export function ReopenPickButtonView({
  onReopen,
  isReopening,
  error,
}: ReopenPickButtonViewProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onReopen}
        disabled={isReopening}
        className="rounded border px-3 py-1 text-xs font-medium text-blue-600 disabled:opacity-50"
      >
        {CATEGORY_DETAIL_COPY.reopenPickButton}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
