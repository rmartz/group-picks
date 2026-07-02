"use client";

import { NEW_PICK_TYPE_SWITCHER_COPY } from "./NewPickTypeSwitcher.copy";
import type { NewPickType } from "./pick-type";

interface NewPickTypeSelectorViewProps {
  pickType: NewPickType;
  onPickTypeChange: (pickType: NewPickType) => void;
}

export function NewPickTypeSelectorView({
  pickType,
  onPickTypeChange,
}: NewPickTypeSelectorViewProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">
        {NEW_PICK_TYPE_SWITCHER_COPY.legend}
      </legend>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex cursor-pointer flex-col gap-1 rounded-md border p-3 text-sm has-checked:border-primary has-checked:bg-accent">
          <span className="flex items-center gap-2 font-medium">
            <input
              type="radio"
              name="pick-type"
              value="standard"
              aria-label={NEW_PICK_TYPE_SWITCHER_COPY.standard.label}
              checked={pickType === "standard"}
              onChange={() => {
                onPickTypeChange("standard");
              }}
            />
            {NEW_PICK_TYPE_SWITCHER_COPY.standard.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {NEW_PICK_TYPE_SWITCHER_COPY.standard.description}
          </span>
        </label>
        <label className="flex cursor-pointer flex-col gap-1 rounded-md border p-3 text-sm has-checked:border-primary has-checked:bg-accent">
          <span className="flex items-center gap-2 font-medium">
            <input
              type="radio"
              name="pick-type"
              value="snap"
              aria-label={NEW_PICK_TYPE_SWITCHER_COPY.snap.label}
              checked={pickType === "snap"}
              onChange={() => {
                onPickTypeChange("snap");
              }}
            />
            {NEW_PICK_TYPE_SWITCHER_COPY.snap.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {NEW_PICK_TYPE_SWITCHER_COPY.snap.description}
          </span>
        </label>
      </div>
    </fieldset>
  );
}
