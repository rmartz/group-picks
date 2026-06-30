"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RankingMode } from "@/lib/types/pick";

import { CREATE_PICK_COPY } from "./copy";

interface CreatePickFormViewProps {
  title: string;
  onTitleChange: (title: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
  topCount: number;
  onTopCountChange: (topCount: number) => void;
  dueDate: string;
  onDueDateChange: (dueDate: string) => void;
  rankingMode: RankingMode;
  onRankingModeChange: (mode: RankingMode) => void;
  resultsVisible: boolean;
  onResultsVisibleChange: (visible: boolean) => void;
  hasPriorPicks: boolean;
  onSubmit: (e: React.SyntheticEvent) => void;
  onCancel: () => void;
  loading: boolean;
  error: string | undefined;
}

export function CreatePickFormView({
  title,
  onTitleChange,
  description,
  onDescriptionChange,
  topCount,
  onTopCountChange,
  dueDate,
  onDueDateChange,
  rankingMode,
  onRankingModeChange,
  resultsVisible,
  onResultsVisibleChange,
  hasPriorPicks,
  onSubmit,
  onCancel,
  loading,
  error,
}: CreatePickFormViewProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{CREATE_PICK_COPY.title}</h2>

      {hasPriorPicks && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">
          <p className="font-medium text-amber-800">
            {CREATE_PICK_COPY.priorPicksBannerTitle}
          </p>
          <p className="text-amber-700">
            {CREATE_PICK_COPY.priorPicksBannerBody}
          </p>
        </div>
      )}

      <form
        aria-label={CREATE_PICK_COPY.title}
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <div className="space-y-1">
          <Label htmlFor="pick-title">{CREATE_PICK_COPY.titleLabel}</Label>
          <Input
            id="pick-title"
            type="text"
            value={title}
            onChange={(e) => {
              onTitleChange(e.target.value);
            }}
            placeholder={CREATE_PICK_COPY.titlePlaceholder}
            disabled={loading}
            required
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pick-description">
            {CREATE_PICK_COPY.descriptionLabel}
          </Label>
          <Textarea
            id="pick-description"
            value={description}
            onChange={(e) => {
              onDescriptionChange(e.target.value);
            }}
            placeholder={CREATE_PICK_COPY.descriptionPlaceholder}
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pick-top-count">
            {CREATE_PICK_COPY.topCountLabel}
          </Label>
          <Input
            id="pick-top-count"
            type="number"
            min={1}
            step={1}
            value={topCount}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              if (!Number.isNaN(parsed) && parsed >= 1) {
                onTopCountChange(parsed);
              }
            }}
            placeholder={CREATE_PICK_COPY.topCountPlaceholder}
            disabled={loading}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="pick-due-date">{CREATE_PICK_COPY.dueDateLabel}</Label>
          <Input
            id="pick-due-date"
            type="date"
            value={dueDate}
            onChange={(e) => {
              onDueDateChange(e.target.value);
            }}
            disabled={loading}
          />
        </div>

        <fieldset className="space-y-1">
          <legend className="text-sm font-medium">
            {CREATE_PICK_COPY.rankingModeLabel}
          </legend>
          <div className="space-y-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="ranking-mode"
                value={RankingMode.TierBuckets}
                checked={rankingMode === RankingMode.TierBuckets}
                onChange={() => {
                  onRankingModeChange(RankingMode.TierBuckets);
                }}
                disabled={loading}
              />
              {CREATE_PICK_COPY.rankingModes.tierBuckets}
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="radio"
                name="ranking-mode"
                value={RankingMode.StackRank}
                checked={rankingMode === RankingMode.StackRank}
                onChange={() => {
                  onRankingModeChange(RankingMode.StackRank);
                }}
                disabled
              />
              {CREATE_PICK_COPY.rankingModes.stackRank}{" "}
              {CREATE_PICK_COPY.rankingModesPostMvp}
            </label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="radio"
                name="ranking-mode"
                value={RankingMode.HeadToHead}
                checked={rankingMode === RankingMode.HeadToHead}
                onChange={() => {
                  onRankingModeChange(RankingMode.HeadToHead);
                }}
                disabled
              />
              {CREATE_PICK_COPY.rankingModes.headToHead}{" "}
              {CREATE_PICK_COPY.rankingModesPostMvp}
            </label>
          </div>
        </fieldset>

        <div className="flex items-start gap-3">
          <input
            id="pick-results-visible"
            type="checkbox"
            checked={resultsVisible}
            onChange={(e) => {
              onResultsVisibleChange(e.target.checked);
            }}
            disabled={loading}
            className="mt-0.5"
          />
          <div>
            <Label htmlFor="pick-results-visible">
              {CREATE_PICK_COPY.resultsVisibleLabel}
            </Label>
            <p className="text-xs text-muted-foreground">
              {CREATE_PICK_COPY.resultsVisibleHint}
            </p>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {CREATE_PICK_COPY.submitButton}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {CREATE_PICK_COPY.cancelButton}
          </Button>
        </div>
      </form>
    </div>
  );
}
