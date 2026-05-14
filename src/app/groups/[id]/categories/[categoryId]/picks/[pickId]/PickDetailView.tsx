"use client";

import { OptionList } from "@/app/categories/[id]/picks/[pickId]/OptionList";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Option } from "@/lib/types/option";
import type { GroupPick } from "@/lib/types/pick";

import { PICK_DETAIL_SCAFFOLD_COPY } from "./copy";
import { EmptyPickView } from "./EmptyPickView";

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

      {isOpen && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => undefined}
        >
          {PICK_DETAIL_SCAFFOLD_COPY.suggestOptionButton}
        </Button>
      )}

      {!isOpen && isCreator && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => undefined}
        >
          {PICK_DETAIL_SCAFFOLD_COPY.reopenButton}
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
          {initialOptions.length === 0 ? (
            <EmptyPickView onSuggestOption={() => undefined} />
          ) : (
            <OptionList
              groupId={groupId}
              categoryId={categoryId}
              pickId={pick.id}
              currentUserId={currentUserId}
              initialOptions={initialOptions}
              initialSuggestions={initialSuggestions}
              pickClosed={!isOpen}
            />
          )}
        </TabsContent>

        <TabsContent value="ranking" className="mt-4">
          <p className="text-sm text-muted-foreground">
            {PICK_DETAIL_SCAFFOLD_COPY.rankingTabPlaceholder}
          </p>
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
