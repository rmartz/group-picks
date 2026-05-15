"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Option } from "@/lib/types/option";
import type { GroupPick } from "@/lib/types/pick";

import { ReopenPickButton } from "../../ReopenPickButton";
import { PICK_DETAIL_SCAFFOLD_COPY } from "./copy";
import { OptionList } from "./OptionList";
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
  const isOpen = pick.closedAt === undefined;
  const isCreator = pick.creatorId === currentUserId;

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

      {!isOpen && isCreator && (
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
          <OptionList
            groupId={groupId}
            categoryId={categoryId}
            pickId={pick.id}
            currentUserId={currentUserId}
            initialOptions={options}
            initialSuggestions={initialSuggestions}
            pickClosed={!isOpen}
            onOptionsChange={setOptions}
          />
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
    </main>
  );
}
