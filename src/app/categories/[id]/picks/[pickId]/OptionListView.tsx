import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Option } from "@/lib/types/option";
import { PICK_DETAIL_COPY } from "./copy";

export interface OptionListViewProps {
  options: Option[];
  suggestions: Option[];
  newTitle: string;
  loading: boolean;
  error: string | undefined;
  onNewTitleChange: (title: string) => void;
  onAddSubmit: (e: React.SyntheticEvent) => void;
  onAdoptSuggestion: (option: Option) => void;
}

export function OptionListView({
  options,
  suggestions,
  newTitle,
  loading,
  error,
  onNewTitleChange,
  onAddSubmit,
  onAdoptSuggestion,
}: OptionListViewProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-medium">
          {PICK_DETAIL_COPY.optionsHeading}
        </h2>

        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {PICK_DETAIL_COPY.noOptionsMessage}
          </p>
        ) : (
          <ul className="space-y-2">
            {options.map((option) => (
              <li key={option.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{option.title}</p>
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
            placeholder={PICK_DETAIL_COPY.addOptionPlaceholder}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" disabled={loading} variant="default">
            {PICK_DETAIL_COPY.addOptionButton}
          </Button>
        </form>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </section>

      {suggestions.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">
            {PICK_DETAIL_COPY.suggestionsHeading}
          </h3>
          <ul className="space-y-2">
            {suggestions.map((suggestion) => (
              <li
                key={suggestion.id}
                className="flex items-center justify-between rounded-md border p-3 text-sm"
              >
                <span>{suggestion.title}</span>
                <Button
                  type="button"
                  onClick={() => {
                    onAdoptSuggestion(suggestion);
                  }}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="ml-4 shrink-0"
                >
                  {PICK_DETAIL_COPY.adoptButton}
                </Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
