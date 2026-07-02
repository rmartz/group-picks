import type { SnapPick, SnapPickOption } from "@/lib/types/snap-pick";

import { SNAP_PICK_DETAIL_COPY } from "./SnapPickDetailView.copy";
import { SnapPickOptionList } from "./SnapPickOptionList";

interface SnapPickDetailViewProps {
  snapPick: SnapPick;
  groupId: string;
  currentUserId: string;
  options: SnapPickOption[];
  activationInProgress?: boolean;
}

// Shell for the Snap Pick detail page. The option-pool (#257) section is live;
// the activation (#258) and voting (#259) sections fill in their slots as those
// features land. The option pool is shown only while no activation is running.
export function SnapPickDetailView({
  snapPick,
  groupId,
  currentUserId,
  options,
  activationInProgress = false,
}: SnapPickDetailViewProps) {
  return (
    <main className="mx-auto max-w-2xl p-4">
      <h1 className="text-2xl font-bold">{snapPick.title}</h1>

      <section className="mt-6" data-slot="option-pool">
        <h2 className="text-lg font-semibold">
          {SNAP_PICK_DETAIL_COPY.optionPoolHeading}
        </h2>
        {activationInProgress ? (
          <p className="text-sm text-muted-foreground">
            {SNAP_PICK_DETAIL_COPY.optionPoolActivationNotice}
          </p>
        ) : (
          <SnapPickOptionList
            groupId={groupId}
            categoryId={snapPick.categoryId}
            snapPickId={snapPick.id}
            currentUserId={currentUserId}
            initialOptions={options}
          />
        )}
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
