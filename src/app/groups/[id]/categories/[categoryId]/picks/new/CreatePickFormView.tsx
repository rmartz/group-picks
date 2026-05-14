"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
          <Label htmlFor="pick-title">{CREATE_PICK_COPY.titleLabel}</Label>
          <Input
            id="pick-title"
            type="text"
            value={title}
            onChange={(e) => {
              onTitleChange(e.target.value);
            }}
            placeholder={CREATE_PICK_COPY.titlePlaceholder}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pick-top-count">
            {CREATE_PICK_COPY.topCountLabel}
          </Label>
          <Input
            id="pick-top-count"
            type="number"
            min={1}
            step={1}
            value={topCount}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              if (!Number.isNaN(parsed) && parsed >= 1) {
                onTopCountChange(parsed);
              }
            }}
            placeholder={CREATE_PICK_COPY.topCountPlaceholder}
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pick-due-date">{CREATE_PICK_COPY.dueDateLabel}</Label>
          <Input
            id="pick-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => {
              onDueDateChange(e.target.value);
            }}
            disabled={loading}
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {CREATE_PICK_COPY.submitButton}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {CREATE_PICK_COPY.cancelButton}
          </Button>
        </div>
      </form>
    </div>
  );
}
