"use client";

import { Button } from "@/components/ui/button";
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
      <Button
        type="button"
        variant="outline"
        onClick={onReopen}
        disabled={isReopening}
      >
        {CATEGORY_DETAIL_COPY.reopenPickButton}
      </Button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
