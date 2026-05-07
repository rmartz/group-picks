"use client";

import { useState } from "react";
import type { PickOption } from "@/lib/types/option";
import { getClientAuth } from "@/lib/firebase/client";
import { createOption } from "@/services/options";
import { OptionListView } from "./OptionListView";
import { OPTION_LIST_COPY } from "./copy";

export interface OptionListProps {
  groupId: string;
  categoryId: string;
  pickId: string;
  initialOptions?: PickOption[];
}

export function OptionList({
  groupId,
  categoryId,
  pickId,
  initialOptions,
}: OptionListProps) {
  const [options, setOptions] = useState<PickOption[]>(initialOptions ?? []);
  const [newOptionName, setNewOptionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

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
      };
      setOptions((prev) => [...prev, newOption]);
      setNewOptionName("");
    } catch {
      setError(OPTION_LIST_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  return (
    <OptionListView
      options={options}
      newOptionName={newOptionName}
      loading={loading}
      error={error}
      onNewOptionNameChange={setNewOptionName}
      onSuggest={(e) => void handleSuggest(e)}
    />
  );
}
