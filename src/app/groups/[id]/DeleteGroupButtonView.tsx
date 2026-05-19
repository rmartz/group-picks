"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { DELETE_GROUP_COPY } from "./DeleteGroupButtonView.copy";

export interface DeleteGroupButtonViewProps {
  groupName: string;
  onDelete: () => void;
  isDeleting: boolean;
  error: string | undefined;
}

export function DeleteGroupButtonView({
  groupName,
  onDelete,
  isDeleting,
  error,
}: DeleteGroupButtonViewProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const canConfirm = confirmText === groupName;

  return (
    <div className="space-y-3 border-t border-destructive/20 pt-3">
      {isConfirming ? (
        <div className="space-y-3" data-testid="delete-group-confirm">
          <p className="text-sm text-destructive">
            {DELETE_GROUP_COPY.confirmPrompt(groupName)}
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
            }}
            placeholder={DELETE_GROUP_COPY.confirmPlaceholder}
            className="w-full rounded-md border px-3 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={!canConfirm}
              onClick={() => {
                if (canConfirm) onDelete();
              }}
            >
              {DELETE_GROUP_COPY.confirmDeleteButton}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsConfirming(false);
                setConfirmText("");
              }}
            >
              {DELETE_GROUP_COPY.cancelButton}
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isDeleting}
          onClick={() => {
            setIsConfirming(true);
          }}
        >
          {isDeleting
            ? DELETE_GROUP_COPY.deletingButton
            : DELETE_GROUP_COPY.deleteButton}
        </Button>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
