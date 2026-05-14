"use client";

import { AlertCircle } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";

import { ERROR_VIEW_COPY } from "./ErrorView.copy";

interface ErrorViewProps {
  onReset: () => void;
}

export function ErrorView({ onReset }: ErrorViewProps) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 p-6 text-center">
      <AlertCircle aria-hidden="true" className="h-12 w-12 text-destructive" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{ERROR_VIEW_COPY.headline}</h1>
        <p className="text-sm text-muted-foreground">{ERROR_VIEW_COPY.body}</p>
      </div>
      <div className="flex gap-3">
        <Button type="button" onClick={onReset}>
          {ERROR_VIEW_COPY.tryAgainButton}
        </Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          {ERROR_VIEW_COPY.goHomeButton}
        </Link>
      </div>
    </main>
  );
}
