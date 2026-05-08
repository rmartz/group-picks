"use client";

import { useState } from "react";
import type { PickOption } from "@/lib/types/option";
import { getClientAuth } from "@/lib/firebase/client";
import { createOption } from "@/services/options";
import { toggleInterest } from "@/services/interests";
import { OptionListView } from "./OptionListView";
import { OPTION_LIST_COPY } from "./copy";

export interface OptionListProps {
  groupId: string;
  categoryId: string;
  pickId: string;
  initialOptions?: PickOption[];
  initialInterests?: string[];
  pickClosed?: boolean;
}

export function OptionList({
  groupId,
  categoryId,
  pickId,
  initialOptions,
  initialInterests,
  pickClosed,
}: OptionListProps) {
  const [options, setOptions] = useState<PickOption[]>(initialOptions ?? []);
  const [newOptionName, setNewOptionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [interestedOptionIds, setInterestedOptionIds] = useState<string[]>(
    initialInterests ?? [],
  );

  async function handleSuggest(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const trimmedName = newOptionName.trim();
      const creatorId = getClientAuth().currentUser?.uid ?? "";
      const { optionId, createdAt } = await createOption(
        groupId,
        categoryId,
        pickId,
        trimmedName,
      );
      const newOption: PickOption = {
        id: optionId,
        name: trimmedName,
        creatorId,
        owners: creatorId ? [creatorId] : [],
        createdAt,
        pickId,
        categoryId,
        interestedCount: 0,
      };
      setOptions((prev) => [...prev, newOption]);
      setNewOptionName("");
    } catch {
      setError(OPTION_LIST_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleInterest(optionId: string) {
    const wasInterested = interestedOptionIds.includes(optionId);
    // Optimistic update
    setInterestedOptionIds((prev) =>
      wasInterested
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId],
    );
    setOptions((prev) =>
      prev.map((o) =>
        o.id === optionId
          ? {
              ...o,
              interestedCount: o.interestedCount + (wasInterested ? -1 : 1),
            }
          : o,
      ),
    );
    try {
      await toggleInterest(groupId, categoryId, pickId, optionId);
    } catch {
      // Revert on failure
      setInterestedOptionIds((prev) =>
        wasInterested
          ? [...prev, optionId]
          : prev.filter((id) => id !== optionId),
      );
      setOptions((prev) =>
        prev.map((o) =>
          o.id === optionId
            ? {
                ...o,
                interestedCount: o.interestedCount + (wasInterested ? 1 : -1),
              }
            : o,
        ),
      );
    }
  }

  return (
    <OptionListView
      options={options}
      newOptionName={newOptionName}
      loading={loading}
      error={error}
      interestedOptionIds={interestedOptionIds}
      onNewOptionNameChange={setNewOptionName}
      onSuggest={(e) => void handleSuggest(e)}
      onToggleInterest={(optionId) => void handleToggleInterest(optionId)}
      pickClosed={pickClosed}
    />
  );
}
