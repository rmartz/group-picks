"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { SnapPick } from "@/lib/types/snap-pick";
import { createSnapPick } from "@/services/snap-picks";

import { SNAP_PICK_SECTION_COPY } from "./SnapPickSection.copy";
import { SnapPickSectionView } from "./SnapPickSectionView";

interface SnapPickSectionProps {
  snapPicks: SnapPick[];
  groupId: string;
  categoryId: string;
}

export function SnapPickSection({
  snapPicks,
  groupId,
  categoryId,
}: SnapPickSectionProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    if (!title.trim() || loading) return;

    setLoading(true);
    setError(undefined);
    try {
      await createSnapPick(groupId, categoryId, title.trim());
      setTitle("");
      router.refresh();
    } catch {
      setError(SNAP_PICK_SECTION_COPY.createError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SnapPickSectionView
      categoryId={categoryId}
      error={error}
      groupId={groupId}
      loading={loading}
      onSubmit={(e) => {
        void handleSubmit(e);
      }}
      onTitleChange={setTitle}
      snapPicks={snapPicks}
      title={title}
    />
  );
}
