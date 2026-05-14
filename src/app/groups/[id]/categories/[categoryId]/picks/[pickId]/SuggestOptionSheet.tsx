"use client";

import { useState } from "react";
import type { Option } from "@/lib/types/option";
import { adoptOption } from "@/services/options";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SUGGEST_OPTION_SHEET_COPY } from "./SuggestOptionSheet.copy";
import { SuggestOptionSheetView } from "./SuggestOptionSheetView";

export interface SuggestOptionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  categoryId: string;
  pickId: string;
  currentUserId: string;
  onOptionAdded: (option: Option) => void;
}

export function SuggestOptionSheet({
  open,
  onOpenChange,
  groupId,
  categoryId,
  pickId,
  currentUserId,
  onOptionAdded,
}: SuggestOptionSheetProps) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (loading) return;
    const trimmed = title.trim();
    if (!trimmed) return;
    setError(undefined);
    setLoading(true);
    try {
      const { optionId } = await adoptOption(
        groupId,
        categoryId,
        pickId,
        trimmed,
      );
      onOptionAdded({
        id: optionId,
        title: trimmed,
        pickId,
        ownerIds: [currentUserId],
      });
      setTitle("");
      onOpenChange(false);
    } catch {
      setError(SUGGEST_OPTION_SHEET_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (loading && !nextOpen) return;
    onOpenChange(nextOpen);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" showCloseButton={false}>
        <SheetHeader>
          <SheetTitle>{SUGGEST_OPTION_SHEET_COPY.sheetTitle}</SheetTitle>
        </SheetHeader>
        <SuggestOptionSheetView
          title={title}
          onTitleChange={setTitle}
          onSubmit={(e) => void handleSubmit(e)}
          onCancel={() => {
            onOpenChange(false);
          }}
          loading={loading}
          error={error}
        />
      </SheetContent>
    </Sheet>
  );
}
