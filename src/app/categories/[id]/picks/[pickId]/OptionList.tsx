"use client";

import { useState } from "react";
import type { Option } from "@/lib/types/option";
import {
  adoptOption,
  joinOptionOwner,
  unjoinOptionOwner,
} from "@/services/options";
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
          {
            id: optionId,
            title: suggestion.title,
            pickId,
            ownerIds: [currentUserId],
          },
        ]);
      }
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    } catch {
      setError(PICK_DETAIL_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleOwner(option: Option) {
    const wasHearted = option.ownerIds.includes(currentUserId);
    setError(undefined);

    // Optimistic update
    if (wasHearted) {
      const willBeEmpty = option.ownerIds.length === 1;
      setOptions((prev) =>
        willBeEmpty
          ? prev.filter((o) => o.id !== option.id)
          : prev.map((o) =>
              o.id === option.id
                ? {
                    ...o,
                    ownerIds: o.ownerIds.filter((uid) => uid !== currentUserId),
                  }
                : o,
            ),
      );
    } else {
      setOptions((prev) =>
        prev.map((o) =>
          o.id === option.id
            ? { ...o, ownerIds: [...o.ownerIds, currentUserId] }
            : o,
        ),
      );
    }

    try {
      if (wasHearted) {
        await unjoinOptionOwner(groupId, categoryId, pickId, option.id);
      } else {
        await joinOptionOwner(groupId, categoryId, pickId, option.id);
      }
    } catch {
      // Revert on failure
      setOptions((prev) => {
        const exists = prev.some((o) => o.id === option.id);
        if (!exists) {
          return [...prev, option];
        }
        return prev.map((o) => (o.id === option.id ? option : o));
      });
      setError(PICK_DETAIL_COPY.errors.default);
    }
  }

  return (
    <OptionListView
      options={options}
      suggestions={suggestions}
      newTitle={newTitle}
      loading={loading}
      error={error}
      currentUserId={currentUserId}
      onNewTitleChange={setNewTitle}
      onAddSubmit={(e) => void handleAddSubmit(e)}
      onAdoptSuggestion={(opt) => void handleAdoptSuggestion(opt)}
      onToggleOwner={(opt) => void handleToggleOwner(opt)}
    />
  );
}
