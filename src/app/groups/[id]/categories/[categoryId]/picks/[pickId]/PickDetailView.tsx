"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
  ClosedPickResultEntry,
  OptionTierAttribution,
} from "@/lib/ranking-score";
import type { Option } from "@/lib/types/option";
import type { GroupPick } from "@/lib/types/pick";
import type { PriorPickBannerData, RankingTier } from "@/lib/types/ranking";
import { reopenPick } from "@/services/picks";

import { ClosedPickResultsView } from "./ClosedPickResultsView";
import { PICK_DETAIL_SCAFFOLD_COPY } from "./copy";
import { EmptyPickView } from "./EmptyPickView";
import { OptionList } from "./OptionList";
import { SuggestOptionSheet } from "./SuggestOptionSheet";
import { TierRanking } from "./TierRanking";
import { TOP_PICKS_VIEW_COPY } from "./TopPicksView.copy";

interface PickDetailViewProps {
  pick: GroupPick;
  groupId: string;
  groupName: string;
  categoryId: string;
  categoryName?: string;
  currentUserId: string;
  initialOptions: Option[];
  initialSuggestions: Option[];
  initialTierAssignments?: Record<string, RankingTier>;
  priorPickBannerData?: PriorPickBannerData;
  closedPickResults: {
    topPicks: ClosedPickResultEntry[];
    runnersUp: ClosedPickResultEntry[];
  };
  topPickAttribution?: Record<string, OptionTierAttribution>;
}

export function PickDetailView({
  pick,
  groupId,
  groupName,
  categoryId,
  categoryName,
  currentUserId,
  initialOptions,
  initialSuggestions,
  initialTierAssignments = {},
  priorPickBannerData,
  closedPickResults,
  topPickAttribution = {},
}: PickDetailViewProps) {
  const router = useRouter();
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [isSuggestSheetOpen, setIsSuggestSheetOpen] = useState(false);
  const [isReopening, setIsReopening] = useState(false);
  const [reopenError, setReopenError] = useState<string | undefined>(undefined);
  const closedAt = pick.closedAt;
  const isOpen = closedAt === undefined;
  const uniqueOwnerCount = new Set(options.flatMap((opt) => opt.ownerIds)).size;
  const breadcrumbs = [
    { label: groupName, href: `/groups/${groupId}` },
    ...(categoryName
      ? [
          {
            label: categoryName,
            href: `/groups/${groupId}/categories/${categoryId}`,
          },
        ]
      : []),
    {
      label: pick.title,
      href: `/groups/${groupId}/categories/${categoryId}/picks/${pick.id}`,
    },
  ];

  async function handleReopen() {
    setIsReopening(true);
    setReopenError(undefined);
    try {
      await reopenPick(groupId, categoryId, pick.id);
      router.refresh();
    } catch (err) {
      setReopenError(
        err instanceof Error ? err.message : "Failed to re-open pick",
      );
    } finally {
      setIsReopening(false);
    }
  }

  function handleOptionAdded({
    optionId,
    title,
  }: {
    optionId: string;
    title: string;
  }) {
    setOptions((prev) => {
      const existingIndex = prev.findIndex((option) => option.id === optionId);
      if (existingIndex >= 0) {
        const existingOption = prev[existingIndex];
        if (
          !existingOption ||
          existingOption.ownerIds.includes(currentUserId)
        ) {
          return prev;
        }

        const updatedOptions = [...prev];
        updatedOptions[existingIndex] = {
          ...existingOption,
          ownerIds: [...existingOption.ownerIds, currentUserId],
        };
        return updatedOptions;
      }

      return [
        ...prev,
        { id: optionId, title, pickId: pick.id, ownerIds: [currentUserId] },
      ];
    });
  }

  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <Breadcrumbs crumbs={breadcrumbs} />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{pick.title}</h1>
        {categoryName && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">
              {PICK_DETAIL_SCAFFOLD_COPY.categoryLabel}
            </span>{" "}
            {categoryName}
          </p>
        )}
        <div className="flex items-center gap-3">
          <Badge variant={isOpen ? "default" : "secondary"}>
            {isOpen
              ? PICK_DETAIL_SCAFFOLD_COPY.openStatusChip
              : PICK_DETAIL_SCAFFOLD_COPY.closedStatusChip}
          </Badge>
          <span className="text-sm text-muted-foreground">
            <span className="font-medium">
              {PICK_DETAIL_SCAFFOLD_COPY.topCountLabel}
            </span>{" "}
            {pick.topCount}
          </span>
        </div>
        {pick.dueDate && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">
              {PICK_DETAIL_SCAFFOLD_COPY.dueDateLabel}
            </span>{" "}
            <span>{pick.dueDate.toLocaleDateString()}</span>
          </p>
        )}
        <p className="text-sm text-muted-foreground">
          <span className="font-medium">
            {PICK_DETAIL_SCAFFOLD_COPY.participantsLabel}
          </span>{" "}
          {uniqueOwnerCount}
        </p>
      </div>

      {isOpen && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            setIsSuggestSheetOpen(true);
          }}
        >
          {PICK_DETAIL_SCAFFOLD_COPY.suggestOptionButton}
        </Button>
      )}

      <Tabs defaultValue="options">
        <TabsList>
          <TabsTrigger value="options">
            {PICK_DETAIL_SCAFFOLD_COPY.tabs.options}
          </TabsTrigger>
          <TabsTrigger value="ranking">
            {PICK_DETAIL_SCAFFOLD_COPY.tabs.ranking}
          </TabsTrigger>
          <TabsTrigger value="top-picks" disabled={isOpen}>
            {PICK_DETAIL_SCAFFOLD_COPY.tabs.topPicks}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="options" className="mt-4">
          {options.length === 0 && initialSuggestions.length === 0 ? (
            <EmptyPickView
              onSuggestOption={
                isOpen
                  ? () => {
                      setIsSuggestSheetOpen(true);
                    }
                  : undefined
              }
            />
          ) : (
            <OptionList
              groupId={groupId}
              categoryId={categoryId}
              pickId={pick.id}
              currentUserId={currentUserId}
              initialOptions={options}
              initialSuggestions={initialSuggestions}
              pickClosed={!isOpen}
              hideAddForm
              onOptionsChange={setOptions}
            />
          )}
        </TabsContent>

        <TabsContent value="ranking" className="mt-4">
          <TierRanking
            groupId={groupId}
            categoryId={categoryId}
            categoryName={categoryName}
            pickId={pick.id}
            initialTierAssignments={initialTierAssignments}
            priorPickBannerData={priorPickBannerData}
            options={options.filter((opt) =>
              opt.ownerIds.includes(currentUserId),
            )}
          />
        </TabsContent>

        <TabsContent value="top-picks" className="mt-4" keepMounted>
          {closedAt === undefined ? (
            <p className="text-sm text-muted-foreground">
              {TOP_PICKS_VIEW_COPY.lockedMessage}
            </p>
          ) : (
            <ClosedPickResultsView
              topCount={pick.topCount}
              topPicks={closedPickResults.topPicks}
              runnersUp={closedPickResults.runnersUp}
              onReopen={() => void handleReopen()}
              isReopening={isReopening}
              reopenError={reopenError}
              topPickAttribution={topPickAttribution}
            />
          )}
        </TabsContent>
      </Tabs>

      <SuggestOptionSheet
        open={isSuggestSheetOpen}
        onOpenChange={setIsSuggestSheetOpen}
        groupId={groupId}
        categoryId={categoryId}
        pickId={pick.id}
        onOptionAdded={handleOptionAdded}
      />
    </main>
  );
}
