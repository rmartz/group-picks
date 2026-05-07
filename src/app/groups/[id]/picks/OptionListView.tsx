"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PickOption } from "@/lib/types/option";
import { OPTION_LIST_COPY } from "./copy";

export interface OptionListViewProps {
  options: PickOption[];
  newOptionName: string;
  loading: boolean;
  error: string | undefined;
  onNewOptionNameChange: (name: string) => void;
  onSuggest: (e: React.SyntheticEvent) => void;
}

export function OptionListView({
  options,
  newOptionName,
  loading,
  error,
  onNewOptionNameChange,
  onSuggest,
}: OptionListViewProps) {
  return (
    <div className="space-y-4">
      <ul className="space-y-2">
        {options.map((option) => (
          <li
            key={option.id}
            className="flex items-center justify-between rounded border p-3"
          >
            <span className="font-medium">{option.name}</span>
            <span className="text-sm text-gray-500">
              {option.owners.length === 1
                ? OPTION_LIST_COPY.ownerCount.one
                : OPTION_LIST_COPY.ownerCount.other(option.owners.length)}
            </span>
          </li>
        ))}
      </ul>

      <form aria-label={OPTION_LIST_COPY.suggestFormLabel} onSubmit={onSuggest} className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newOptionName}
            onChange={(e) => {
              onNewOptionNameChange(e.target.value);
            }}
            placeholder={OPTION_LIST_COPY.suggestPlaceholder}
            disabled={loading}
          />
          <Button type="submit" disabled={loading}>
            {OPTION_LIST_COPY.suggestButton}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
