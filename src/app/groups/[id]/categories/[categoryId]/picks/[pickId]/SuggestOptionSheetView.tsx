"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SUGGEST_OPTION_SHEET_COPY } from "./SuggestOptionSheet.copy";

export interface SuggestOptionSheetViewProps {
  title: string;
  onTitleChange: (value: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | undefined;
}

export function SuggestOptionSheetView({
  title,
  onTitleChange,
  onSubmit,
  onCancel,
  loading,
  error,
}: SuggestOptionSheetViewProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 p-4">
      <div className="space-y-1.5">
        <Label htmlFor="suggest-option-title">
          {SUGGEST_OPTION_SHEET_COPY.titleLabel}
        </Label>
        <Input
          id="suggest-option-title"
          type="text"
          value={title}
          onChange={(e) => {
            onTitleChange(e.target.value);
          }}
          placeholder={SUGGEST_OPTION_SHEET_COPY.titlePlaceholder}
          disabled={loading}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {SUGGEST_OPTION_SHEET_COPY.suggestButton}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          {SUGGEST_OPTION_SHEET_COPY.cancelButton}
        </Button>
      </div>
    </form>
  );
}
