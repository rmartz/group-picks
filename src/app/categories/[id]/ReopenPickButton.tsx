"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { reopenPick } from "@/services/picks";
import { ReopenPickButtonView } from "./ReopenPickButtonView";
import { CATEGORY_DETAIL_COPY } from "./copy";

interface ReopenPickButtonProps {
  groupId: string;
  categoryId: string;
  pickId: string;
  onReopened?: () => void;
}

export function ReopenPickButton({
  groupId,
  categoryId,
  pickId,
  onReopened,
}: ReopenPickButtonProps) {
  const router = useRouter();
  const [isReopening, setIsReopening] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  async function handleReopen() {
    setIsReopening(true);
    setError(undefined);
    try {
      await reopenPick(groupId, categoryId, pickId);
      router.refresh();
      onReopened?.();
    } catch {
      setError(CATEGORY_DETAIL_COPY.errors.reopenFailed);
    } finally {
      setIsReopening(false);
    }
  }

  return (
    <ReopenPickButtonView
      onReopen={() => void handleReopen()}
      isReopening={isReopening}
      error={error}
    />
  );
}
