import { Button } from "@/components/ui/button";
import type { DebugProfile } from "@/lib/debug/profiles";

import { DEBUG_SWITCHER_COPY } from "./DebugUserSwitcher.copy";

interface DebugUserSwitcherViewProps {
  profiles: readonly DebugProfile[];
  onSelect: (id: string) => void;
  loadingId: string | undefined;
  error: string | undefined;
}

export function DebugUserSwitcherView({
  profiles,
  onSelect,
  loadingId,
  error,
}: DebugUserSwitcherViewProps) {
  return (
    <aside
      aria-label={DEBUG_SWITCHER_COPY.heading}
      className="fixed bottom-4 right-4 z-50 w-64 rounded-lg border bg-background p-3 shadow-lg"
    >
      <p className="text-sm font-semibold">{DEBUG_SWITCHER_COPY.heading}</p>
      <p className="mb-2 text-xs text-muted-foreground">
        {DEBUG_SWITCHER_COPY.hint}
      </p>

      <ul className="space-y-1">
        {profiles.map((profile) => (
          <li key={profile.id}>
            <Button
              className="h-auto w-full flex-col items-start gap-0 py-1.5 text-left"
              disabled={loadingId !== undefined}
              onClick={() => {
                onSelect(profile.id);
              }}
              variant="outline"
            >
              <span className="text-sm">
                {loadingId === profile.id
                  ? DEBUG_SWITCHER_COPY.signingIn
                  : profile.label}
              </span>
              <span className="text-xs font-normal text-muted-foreground">
                {profile.description}
              </span>
            </Button>
          </li>
        ))}
      </ul>

      {error !== undefined && (
        <p className="mt-2 text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </aside>
  );
}
