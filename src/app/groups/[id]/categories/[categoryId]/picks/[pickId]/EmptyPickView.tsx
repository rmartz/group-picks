"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { EMPTY_PICK_COPY } from "./EmptyPickView.copy";

interface EmptyPickViewProps {
  onSuggestOption: () => void;
}

export function EmptyPickView({ onSuggestOption }: EmptyPickViewProps) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6 text-center">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{EMPTY_PICK_COPY.headline}</h2>
          <p className="text-sm text-muted-foreground">
            {EMPTY_PICK_COPY.body}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            onSuggestOption();
          }}
        >
          {EMPTY_PICK_COPY.ctaButton}
        </Button>
      </CardContent>
    </Card>
  );
}
