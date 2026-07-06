import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SnapPickOption } from "@/lib/types/snap-pick";

import { SNAP_PICK_OPTION_LIST_COPY } from "./SnapPickOptionList.copy";

export interface SnapPickOptionListViewProps {
  options: SnapPickOption[];
  currentUserId: string;
  newTitle: string;
  loading: boolean;
  error: string | undefined;
  onNewTitleChange: (title: string) => void;
  onAddSubmit: (e: React.SyntheticEvent) => void;
  onRemove: (option: SnapPickOption) => void;
}

export function SnapPickOptionListView({
  options,
  currentUserId,
  newTitle,
  loading,
  error,
  onNewTitleChange,
  onAddSubmit,
  onRemove,
}: SnapPickOptionListViewProps) {
  return (
    <div className="space-y-3">
      {options.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {SNAP_PICK_OPTION_LIST_COPY.noOptionsMessage}
        </p>
      ) : (
        <ul className="space-y-2">
          {options.map((option) => (
            <li
              key={option.id}
              className="flex items-center justify-between gap-3 rounded-md border p-3 text-sm"
            >
              <span className="min-w-0 flex-1 font-medium">{option.title}</span>
              {option.addedBy === currentUserId && (
                <Button
                  type="button"
                  onClick={() => {
                    onRemove(option);
                  }}
                  disabled={loading}
                  variant="ghost"
                  size="sm"
                  aria-label={`${SNAP_PICK_OPTION_LIST_COPY.removeOptionLabel}: ${option.title}`}
                  className="shrink-0"
                >
                  {SNAP_PICK_OPTION_LIST_COPY.removeOptionButton}
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={onAddSubmit} className="flex gap-2">
        <Input
          type="text"
          value={newTitle}
          onChange={(e) => {
            onNewTitleChange(e.target.value);
          }}
          placeholder={SNAP_PICK_OPTION_LIST_COPY.addOptionPlaceholder}
          disabled={loading}
          className="flex-1"
        />
        <Button type="submit" disabled={loading} variant="default">
          {SNAP_PICK_OPTION_LIST_COPY.addOptionButton}
        </Button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
