import { GROUP_DETAIL_COPY } from "./copy";

interface GroupSettingsPanelViewProps {
  picksRestricted: boolean;
  onTogglePicksRestricted: () => void;
  isSaving: boolean;
  error: string | undefined;
}

export function GroupSettingsPanelView({
  picksRestricted,
  onTogglePicksRestricted,
  isSaving,
  error,
}: GroupSettingsPanelViewProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold">
        {GROUP_DETAIL_COPY.settings.heading}
      </h2>
      <div className="flex items-center gap-3">
        <input
          id="picks-restricted-toggle"
          type="checkbox"
          checked={picksRestricted}
          onChange={onTogglePicksRestricted}
          disabled={isSaving}
          className="h-4 w-4 cursor-pointer"
        />
        <label htmlFor="picks-restricted-toggle" className="text-sm">
          {GROUP_DETAIL_COPY.settings.picksRestrictedLabel}
        </label>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </section>
  );
}
