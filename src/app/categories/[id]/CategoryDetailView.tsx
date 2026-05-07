import type { Category } from "@/lib/types/category";
import type { GroupPick } from "@/lib/types/pick";
import { runRankedChoice } from "@/lib/ranked-choice";
import { CATEGORY_DETAIL_COPY } from "./copy";

interface CategoryDetailViewProps {
  category: Category;
  picks: GroupPick[];
}

export function CategoryDetailView({
  category,
  picks,
}: CategoryDetailViewProps) {
  const topPickCount = category.topPickCount;
  const shouldShowTopPicks =
    topPickCount !== undefined &&
    Number.isFinite(topPickCount) &&
    topPickCount > 0;
  const isClosed = category.closedAt !== undefined;
  const rankedCount = category.rankedCount;
  const totalCount = category.totalCount;
  const progressPercent =
    rankedCount !== undefined && totalCount !== undefined && totalCount > 0
      ? Math.min(100, Math.max(0, (rankedCount / totalCount) * 100))
      : 0;
  const topResults =
    shouldShowTopPicks && isClosed
      ? runRankedChoice(
          category.rankedBallots ?? [],
          picks.map((pick) => pick.id),
        )
          .flat()
          .map((pickId) => picks.find((pick) => pick.id === pickId))
          .filter((pick): pick is GroupPick => pick !== undefined)
          .slice(0, topPickCount)
      : [];

  return (
    <main className="mx-auto max-w-lg space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{category.name}</h1>
        {category.description?.trim() && (
          <p className="text-sm text-muted-foreground">
            {category.description}
          </p>
        )}
      </div>
      <section className="space-y-3">
        <h2 className="text-lg font-medium">
          {CATEGORY_DETAIL_COPY.picksLabel}
        </h2>
        {picks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {CATEGORY_DETAIL_COPY.noPicksMessage}
          </p>
        ) : (
          <ul className="space-y-2">
            {picks.map((pick) => (
              <li key={pick.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">{pick.title}</p>
                {pick.description?.trim() && (
                  <p className="text-muted-foreground">{pick.description}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
      {shouldShowTopPicks && (
        <section className="space-y-3">
          {isClosed ? (
            <>
              <h2 className="text-lg font-medium">
                {CATEGORY_DETAIL_COPY.topPicksLabelPrefix} {topPickCount}
              </h2>
              {topResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {CATEGORY_DETAIL_COPY.topPicksNoResultsMessage}
                </p>
              ) : (
                <ul className="space-y-2">
                  {topResults.map((pick, index) => (
                    <li key={pick.id} className="rounded-md border p-3 text-sm">
                      <p className="font-medium">
                        #{index + 1} {pick.title}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </>
          ) : (
            <>
              <h2 className="text-lg font-medium">
                {CATEGORY_DETAIL_COPY.topPicksLockedLabel}
              </h2>
              <div className="rounded-md border p-4 text-center">
                <p className="text-3xl">🔒</p>
                <p className="mt-2 text-sm font-medium">
                  {CATEGORY_DETAIL_COPY.topPicksLockedHeadline}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {CATEGORY_DETAIL_COPY.topPicksLockedDescription}
                </p>
                {rankedCount !== undefined && totalCount !== undefined && (
                  <div className="mt-3 text-left">
                    <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                      {CATEGORY_DETAIL_COPY.topPicksProgressLabel}
                    </p>
                    <div className="mt-2 h-1.5 rounded bg-muted">
                      <div
                        className="h-1.5 rounded bg-foreground"
                        style={{
                          width: progressPercent.toString() + "%",
                        }}
                      />
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {rankedCount}/{totalCount}
                    </p>
                  </div>
                )}
              </div>
              <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                {CATEGORY_DETAIL_COPY.topPicksAdminHint}
              </p>
            </>
          )}
        </section>
      )}
    </main>
  );
}
