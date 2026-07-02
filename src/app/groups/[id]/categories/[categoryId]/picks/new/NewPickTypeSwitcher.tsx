"use client";

import { useState } from "react";

import { CreatePickForm } from "./CreatePickForm";
import { CreateSnapPickForm } from "./CreateSnapPickForm";
import { NewPickTypeSelectorView } from "./NewPickTypeSelectorView";
import type { NewPickType } from "./pick-type";

interface NewPickTypeSwitcherProps {
  groupId: string;
  categoryId: string;
  hasPriorPicks: boolean;
}

export function NewPickTypeSwitcher({
  groupId,
  categoryId,
  hasPriorPicks,
}: NewPickTypeSwitcherProps) {
  const [pickType, setPickType] = useState<NewPickType>("standard");

  return (
    <div className="space-y-6">
      <NewPickTypeSelectorView
        pickType={pickType}
        onPickTypeChange={setPickType}
      />
      {pickType === "standard" ? (
        <CreatePickForm
          groupId={groupId}
          categoryId={categoryId}
          hasPriorPicks={hasPriorPicks}
        />
      ) : (
        <CreateSnapPickForm groupId={groupId} categoryId={categoryId} />
      )}
    </div>
  );
}
