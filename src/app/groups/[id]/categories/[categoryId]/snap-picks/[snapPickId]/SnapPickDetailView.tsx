import type { SnapPick } from "@/lib/types/snap-pick";

import { SNAP_PICK_DETAIL_COPY } from "./SnapPickDetailView.copy";

interface SnapPickDetailViewProps {
  snapPick: SnapPick;
}

// Shell for the Snap Pick detail page. The option-pool (#257), activation
// (#258), and voting (#259) sections fill in their slots below as those
// features land.
export function SnapPickDetailView({ snapPick }: SnapPickDetailViewProps) {
  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold">{snapPick.title}</h1>

      <section className="mt-6" data-slot="option-pool">
        <h2 className="text-lg font-semibold">
          {SNAP_PICK_DETAIL_COPY.optionPoolHeading}
        </h2>
        <p className="text-sm text-muted-foreground">
          {SNAP_PICK_DETAIL_COPY.optionPoolPlaceholder}
        </p>
      </section>

      <section className="mt-6" data-slot="activation">
        <h2 className="text-lg font-semibold">
          {SNAP_PICK_DETAIL_COPY.activationHeading}
        </h2>
        <p className="text-sm text-muted-foreground">
          {SNAP_PICK_DETAIL_COPY.activationPlaceholder}
        </p>
      </section>

      <section className="mt-6" data-slot="voting">
        <h2 className="text-lg font-semibold">
          {SNAP_PICK_DETAIL_COPY.votingHeading}
        </h2>
        <p className="text-sm text-muted-foreground">
          {SNAP_PICK_DETAIL_COPY.votingPlaceholder}
        </p>
      </section>
    </main>
  );
}
