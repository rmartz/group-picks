import { Breadcrumbs } from "@/components/breadcrumbs";
import type {
  SnapPick,
  SnapPickActivation,
  SnapPickHistoryEntry,
  SnapPickOption,
  SnapPickRatings,
} from "@/lib/types/snap-pick";

import { SnapPickActivationPanel } from "./SnapPickActivationPanel";
import { SNAP_PICK_DETAIL_COPY } from "./SnapPickDetailView.copy";
import { SnapPickHistoryView } from "./SnapPickHistoryView";
import { SnapPickMatchup } from "./SnapPickMatchup";
import { SnapPickOptionList } from "./SnapPickOptionList";

interface SnapPickDetailViewProps {
  snapPick: SnapPick;
  groupId: string;
  groupName: string;
  categoryName?: string;
  currentUserId: string;
  options: SnapPickOption[];
  // The most recent activation for this snap pick, if one has ever run. Open
  // (closedAt undefined) means voting is in progress; closed carries the winner.
  activation?: SnapPickActivation;
  // Resolved title of the winning option from the most recent closed run.
  winnerTitle?: string;
  // Pair keys the current member has already voted on in the open activation, so
  // the voting screen resumes from their remaining matchup queue.
  votedPairKeys: string[];
  // The current member's global preference model for this snap pick, used to
  // focus the matchup queue on relevant options. Absent for a member with no
  // vote history (every option is then treated as neutral / cold-start).
  ratings?: SnapPickRatings;
  // Past (closed) runs with their winners and participant counts, newest first.
  historyEntries: SnapPickHistoryEntry[];
}

// Shell for the Snap Pick detail page. The option-pool (#257) and activation
// (#258) sections are live; the voting (#259) section fills in its slot as that
// feature lands. The option pool is shown only while no activation is running.
export function SnapPickDetailView({
  snapPick,
  groupId,
  groupName,
  categoryName,
  currentUserId,
  options,
  activation,
  winnerTitle,
  votedPairKeys,
  ratings,
  historyEntries,
}: SnapPickDetailViewProps) {
  const activationInProgress =
    activation !== undefined && activation.closedAt === undefined;
  const activeClosesAt = activationInProgress ? activation.closesAt : undefined;
  const breadcrumbs = [
    { label: groupName, href: `/groups/${groupId}` },
    ...(categoryName
      ? [
          {
            label: categoryName,
            href: `/groups/${groupId}/categories/${snapPick.categoryId}`,
          },
        ]
      : []),
    {
      label: snapPick.title,
      href: `/groups/${groupId}/categories/${snapPick.categoryId}/snap-picks/${snapPick.id}`,
    },
  ];
  return (
    <main className="mx-auto max-w-2xl p-4">
      <Breadcrumbs crumbs={breadcrumbs} />
      <h1 className="mt-4 text-2xl font-bold">{snapPick.title}</h1>

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
        {activationInProgress ? (
          <SnapPickMatchup
            groupId={groupId}
            categoryId={snapPick.categoryId}
            snapPickId={snapPick.id}
            activationId={activation.id}
            options={options}
            votedPairKeys={votedPairKeys}
            ratings={ratings}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {SNAP_PICK_DETAIL_COPY.votingPlaceholder}
          </p>
        )}
      </section>

      <section className="mt-6" data-slot="history">
        <h2 className="text-lg font-semibold">
          {SNAP_PICK_DETAIL_COPY.historyHeading}
        </h2>
        <SnapPickHistoryView entries={historyEntries} />
      </section>
    </main>
  );
}
