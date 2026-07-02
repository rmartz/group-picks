"use client";

import { useState } from "react";

import type { SnapPickOption } from "@/lib/types/snap-pick";
import { addSnapPickOption, removeSnapPickOption } from "@/services/snap-picks";

import { SNAP_PICK_OPTION_LIST_COPY } from "./SnapPickOptionList.copy";
import { SnapPickOptionListView } from "./SnapPickOptionListView";

interface SnapPickOptionListProps {
  groupId: string;
  categoryId: string;
  snapPickId: string;
  currentUserId: string;
  initialOptions: SnapPickOption[];
}

export function SnapPickOptionList({
  groupId,
  categoryId,
  snapPickId,
  currentUserId,
  initialOptions,
}: SnapPickOptionListProps) {
  const [options, setOptions] = useState<SnapPickOption[]>(initialOptions);
  const [newTitle, setNewTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleAddSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    setError(undefined);
    setLoading(true);
    try {
      const { optionId, addedAt } = await addSnapPickOption(
        groupId,
        categoryId,
        snapPickId,
        title,
      );
      setOptions((prev) => [
        ...prev,
        { id: optionId, title, addedBy: currentUserId, addedAt },
      ]);
      setNewTitle("");
    } catch {
      setError(SNAP_PICK_OPTION_LIST_COPY.errorDefault);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(option: SnapPickOption) {
    setError(undefined);
    setLoading(true);
    // Optimistically drop the option from the visible pool.
    setOptions((prev) => prev.filter((o) => o.id !== option.id));
    try {
      await removeSnapPickOption(groupId, categoryId, snapPickId, option.id);
    } catch {
      // Restore on failure, preserving the original order.
      setOptions((prev) =>
        [...prev, option].sort(
          (a, b) => a.addedAt.getTime() - b.addedAt.getTime(),
        ),
      );
      setError(SNAP_PICK_OPTION_LIST_COPY.errorDefault);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SnapPickOptionListView
      options={options}
      currentUserId={currentUserId}
      newTitle={newTitle}
      loading={loading}
      error={error}
      onNewTitleChange={setNewTitle}
      onAddSubmit={(e) => void handleAddSubmit(e)}
      onRemove={(option) => void handleRemove(option)}
    />
  );
}
