"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { CREATE_SNAP_PICK_COPY } from "./CreateSnapPickForm.copy";

interface CreateSnapPickFormViewProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | undefined;
}

export function CreateSnapPickFormView({
  title,
  onTitleChange,
  onSubmit,
  onCancel,
  loading,
  error,
}: CreateSnapPickFormViewProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{CREATE_SNAP_PICK_COPY.title}</h2>
        <p className="text-sm text-muted-foreground">
          {CREATE_SNAP_PICK_COPY.subtitle}
        </p>
      </div>

      <form
        aria-label={CREATE_SNAP_PICK_COPY.title}
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <div className="space-y-1">
          <Label htmlFor="snap-pick-title">
            {CREATE_SNAP_PICK_COPY.nameLabel}
          </Label>
          <Input
            id="snap-pick-title"
            type="text"
            value={title}
            onChange={(e) => {
              onTitleChange(e.target.value);
            }}
            placeholder={CREATE_SNAP_PICK_COPY.namePlaceholder}
            disabled={loading}
            required
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading || !title.trim()}>
            {loading
              ? CREATE_SNAP_PICK_COPY.submittingButton
              : CREATE_SNAP_PICK_COPY.submitButton}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {CREATE_SNAP_PICK_COPY.cancelButton}
          </Button>
        </div>
      </form>
    </div>
  );
}
