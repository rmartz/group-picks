"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PickOption } from "@/lib/types/option";
import { HeartButton } from "./HeartButton";
import { OPTION_LIST_COPY } from "./copy";

export interface OptionListViewProps {
  options: PickOption[];
  newOptionName: string;
  loading: boolean;
  error: string | undefined;
  interestedOptionIds: string[];
  onNewOptionNameChange: (name: string) => void;
  onSuggest: (e: React.SyntheticEvent) => void;
  onToggleInterest: (optionId: string) => void;
  pickClosed?: boolean;
}

export function OptionListView({
  options,
  newOptionName,
  loading,
  error,
  interestedOptionIds,
  onNewOptionNameChange,
  onSuggest,
  onToggleInterest,
  pickClosed,
}: OptionListViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">
          {OPTION_LIST_COPY.headerCaption}
        </span>
        <Button
          type="button"
          onClick={onSuggest}
          disabled={loading || pickClosed}
        >
          {OPTION_LIST_COPY.suggestButton}
        </Button>
      </div>

      <ul className="space-y-2">
        {options.map((option) => (
          <li
            key={option.id}
            className="flex items-center justify-between gap-2 rounded border p-3"
          >
            <span className="font-medium">{option.name}</span>
            <span className="text-sm text-gray-500">
              {OPTION_LIST_COPY.interestCount(
                option.interestedCount,
                options.length,
              )}
            </span>
            <HeartButton
              interested={interestedOptionIds.includes(option.id)}
              disabled={loading || pickClosed}
              onClick={() => {
                onToggleInterest(option.id);
              }}
            />
          </li>
        ))}
      </ul>

      <form aria-label="form" onSubmit={onSuggest} className="space-y-2">
        <div className="flex gap-2">
          <Input
            value={newOptionName}
            onChange={(e) => {
              onNewOptionNameChange(e.target.value);
            }}
            placeholder={OPTION_LIST_COPY.suggestPlaceholder}
            disabled={loading || pickClosed}
          />
          <Button type="submit" disabled={loading || pickClosed}>
            {OPTION_LIST_COPY.suggestButton}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </form>
    </div>
  );
}
