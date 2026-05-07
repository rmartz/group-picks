import type { Category } from "@/lib/types/category";
import { PickStatus, type GroupPick } from "@/lib/types/pick";
import { PickStatusChip } from "@/components/PickStatusChip";
import { GROUP_DETAIL_COPY } from "./copy";

// Warm muted beige matching the closed-state design accent color.
const CLOSED_PICK_BORDER_COLOR = "#cdb8ad";

export interface PicksByCategoryProps {
  categories: Category[];
  picks: GroupPick[];
}

interface CategoryPickGroup {
  categoryId: string;
  categoryName: string;
  picks: GroupPick[];
}

export function groupPicksByCategory(
  categories: Category[],
  picks: GroupPick[],
): CategoryPickGroup[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const picksByCategoryId = new Map<string, GroupPick[]>();

  for (const pick of picks) {
    const bucket = picksByCategoryId.get(pick.categoryId) ?? [];
    bucket.push(pick);
    picksByCategoryId.set(pick.categoryId, bucket);
  }

  return Array.from(picksByCategoryId.entries()).map(
    ([categoryId, categoryPicks]) => ({
      categoryId,
      categoryName: categoryMap.get(categoryId) ?? categoryId,
      picks: categoryPicks,
    }),
  );
}

export function PicksByCategory({ categories, picks }: PicksByCategoryProps) {
  const groups = groupPicksByCategory(categories, picks);

  return (
    <div className="space-y-4">
      {groups.map(({ categoryId, categoryName, picks: categoryPicks }) => (
        <div key={categoryId} className="space-y-2">
          <h3 className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {categoryName}
          </h3>
          <ul className="space-y-2">
            {categoryPicks.map((pick) => (
              <li
                key={pick.id}
                className="rounded-md border p-3 text-sm"
                style={{
                  borderLeftWidth: "3px",
                  borderLeftColor:
                    pick.status === PickStatus.Open
                      ? "black"
                      : CLOSED_PICK_BORDER_COLOR,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{pick.title}</p>
                  <PickStatusChip status={pick.status} />
                </div>
                {pick.dueDate && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {pick.status === PickStatus.Open
                      ? GROUP_DETAIL_COPY.closesPrefix
                      : GROUP_DETAIL_COPY.closedPrefix}{" "}
                    {pick.dueDate.toLocaleDateString()}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
