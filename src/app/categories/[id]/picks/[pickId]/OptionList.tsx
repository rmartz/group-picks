"use client";

import { useState } from "react";
import type { Option } from "@/lib/types/option";
import { adoptOption } from "@/services/options";
import { OptionListView } from "./OptionListView";
import { PICK_DETAIL_COPY } from "./copy";

interface OptionListProps {
  groupId: string;
  categoryId: string;
  pickId: string;
  currentUserId: string;
  initialOptions: Option[];
  initialSuggestions: Option[];
}

export function OptionList({
  groupId,
  categoryId,
  pickId,
  currentUserId,
  initialOptions,
  initialSuggestions,
}: OptionListProps) {
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [suggestions, setSuggestions] = useState<Option[]>(initialSuggestions);
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
      const { optionId } = await adoptOption(
        groupId,
        categoryId,
        pickId,
        title,
      );
      const existing = options.find((o) => o.id === optionId);
      if (existing) {
        setOptions((prev) =>
          prev.map((o) =>
            o.id === optionId && !o.ownerIds.includes(currentUserId)
              ? { ...o, ownerIds: [...o.ownerIds, currentUserId] }
              : o,
          ),
        );
      } else {
        setOptions((prev) => [
          ...prev,
          { id: optionId, title, pickId, ownerIds: [currentUserId] },
        ]);
      }
      setSuggestions((prev) =>
        prev.filter((s) => s.title.toLowerCase() !== title.toLowerCase()),
      );
      setNewTitle("");
    } catch {
      setError(PICK_DETAIL_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdoptSuggestion(suggestion: Option) {
    setError(undefined);
    setLoading(true);
    try {
      const { optionId } = await adoptOption(
        groupId,
        categoryId,
        pickId,
        suggestion.title,
      );
      const existing = options.find((o) => o.id === optionId);
      if (existing) {
        setOptions((prev) =>
          prev.map((o) =>
            o.id === optionId && !o.ownerIds.includes(currentUserId)
              ? { ...o, ownerIds: [...o.ownerIds, currentUserId] }
              : o,
          ),
        );
      } else {
        setOptions((prev) => [
          ...prev,
          { id: optionId, title: suggestion.title, pickId, ownerIds: [currentUserId] },
        ]);
      }
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    } catch {
      setError(PICK_DETAIL_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  return (
    <OptionListView
      options={options}
      suggestions={suggestions}
      newTitle={newTitle}
      loading={loading}
      error={error}
      onNewTitleChange={setNewTitle}
      onAddSubmit={(e) => void handleAddSubmit(e)}
      onAdoptSuggestion={(opt) => void handleAdoptSuggestion(opt)}
    />
  );
}
