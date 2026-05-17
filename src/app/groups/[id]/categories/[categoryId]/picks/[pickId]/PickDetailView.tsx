"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Option } from "@/lib/types/option";
import type { GroupPick } from "@/lib/types/pick";

import { ReopenPickButton } from "../../ReopenPickButton";
import { PICK_DETAIL_SCAFFOLD_COPY } from "./copy";
import { EmptyPickView } from "./EmptyPickView";
import { OptionList } from "./OptionList";
import { SuggestOptionSheet } from "./SuggestOptionSheet";
import { TierRanking } from "./TierRanking";

interface PickDetailViewProps {
  pick: GroupPick;
  groupId: string;
  categoryId: string;
  currentUserId: string;
  initialOptions: Option[];
  initialSuggestions: Option[];
}

export function PickDetailView({
  pick,
  groupId,
  categoryId,
  currentUserId,
  initialOptions,
  initialSuggestions,
}: PickDetailViewProps) {
  const [options, setOptions] = useState<Option[]>(initialOptions);
  const [isSuggestSheetOpen, setIsSuggestSheetOpen] = useState(false);
  const isOpen = pick.closedAt === undefined;

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
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{pick.title}</h1>
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

      {!isOpen && (
        <ReopenPickButton
          groupId={groupId}
          categoryId={categoryId}
          pickId={pick.id}
        />
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
            options={options.filter((opt) =>
              opt.ownerIds.includes(currentUserId),
            )}
          />
        </TabsContent>

        <TabsContent value="top-picks" className="mt-4" keepMounted>
          <p className="text-sm text-muted-foreground">
            {isOpen
              ? PICK_DETAIL_SCAFFOLD_COPY.topPicksLockedPlaceholder
              : PICK_DETAIL_SCAFFOLD_COPY.resultsPlaceholder}
          </p>
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
