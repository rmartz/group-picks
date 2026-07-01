import type {
  SnapPick,
  SnapPickActivation,
  SnapPickOption,
} from "@/lib/types/snap-pick";

import { SnapPickActivationPanel } from "./SnapPickActivationPanel";
import { SNAP_PICK_DETAIL_COPY } from "./SnapPickDetailView.copy";
import { SnapPickOptionList } from "./SnapPickOptionList";

interface SnapPickDetailViewProps {
  snapPick: SnapPick;
  groupId: string;
  currentUserId: string;
  options: SnapPickOption[];
  // The most recent activation for this snap pick, if one has ever run. Open
  // (closedAt undefined) means voting is in progress; closed carries the winner.
  activation?: SnapPickActivation;
  // Resolved title of the winning option from the most recent closed run.
  winnerTitle?: string;
}

// Shell for the Snap Pick detail page. The option-pool (#257) and activation
// (#258) sections are live; the voting (#259) section fills in its slot as that
// feature lands. The option pool is shown only while no activation is running.
export function SnapPickDetailView({
  snapPick,
  groupId,
  currentUserId,
  options,
  activation,
  winnerTitle,
}: SnapPickDetailViewProps) {
  const activationInProgress =
    activation !== undefined && activation.closedAt === undefined;
  const activeClosesAt = activationInProgress ? activation.closesAt : undefined;
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
        <SnapPickActivationPanel
          groupId={groupId}
          categoryId={snapPick.categoryId}
          snapPickId={snapPick.id}
          activeClosesAt={activeClosesAt}
          lastWinnerTitle={winnerTitle}
          hasClosedRun={activation?.closedAt !== undefined}
        />
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
