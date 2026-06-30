import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SnapPick } from "@/lib/types/snap-pick";

import { SNAP_PICK_SECTION_COPY } from "./SnapPickSection.copy";

interface SnapPickSectionViewProps {
  snapPicks: SnapPick[];
  groupId: string;
  categoryId: string;
  title: string;
  onTitleChange: (title: string) => void;
  onSubmit: (e: React.SyntheticEvent) => void;
  loading: boolean;
  error: string | undefined;
}

export function SnapPickSectionView({
  snapPicks,
  groupId,
  categoryId,
  title,
  onTitleChange,
  onSubmit,
  loading,
  error,
}: SnapPickSectionViewProps) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-lg font-semibold">
        {SNAP_PICK_SECTION_COPY.heading}
      </h2>

      {snapPicks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {SNAP_PICK_SECTION_COPY.empty}
        </p>
      ) : (
        <ul className="space-y-2">
          {snapPicks.map((snapPick) => (
            <li key={snapPick.id}>
              <Link
                className="block rounded-md border p-3 hover:bg-accent"
                href={`/groups/${groupId}/categories/${categoryId}/snap-picks/${snapPick.id}`}
              >
                {snapPick.title}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <form className="mt-4 flex items-center gap-2" onSubmit={onSubmit}>
        <Input
          aria-label={SNAP_PICK_SECTION_COPY.titlePlaceholder}
          onChange={(e) => {
            onTitleChange(e.target.value);
          }}
          placeholder={SNAP_PICK_SECTION_COPY.titlePlaceholder}
          value={title}
        />
        <Button disabled={loading || !title.trim()} type="submit">
          {loading
            ? SNAP_PICK_SECTION_COPY.creating
            : SNAP_PICK_SECTION_COPY.createButton}
        </Button>
      </form>

      {error !== undefined && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
