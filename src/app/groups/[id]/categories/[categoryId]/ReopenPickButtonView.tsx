"use client";

import { CATEGORY_DETAIL_COPY } from "./copy";

interface ReopenPickButtonViewProps {
  onReopen: () => void;
  isReopening: boolean;
  error: string | undefined;
  pickTitle?: string;
}

export function ReopenPickButtonView({
  onReopen,
  isReopening,
  error,
  pickTitle,
}: ReopenPickButtonViewProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onReopen}
        disabled={isReopening}
        aria-label={
          pickTitle
            ? `${CATEGORY_DETAIL_COPY.reopenPickButton} ${pickTitle}`
            : undefined
        }
        className="rounded border px-3 py-1 text-xs font-medium text-blue-600 disabled:opacity-50"
      >
        {CATEGORY_DETAIL_COPY.reopenPickButton}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
