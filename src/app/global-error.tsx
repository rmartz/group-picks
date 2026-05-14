"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { GLOBAL_ERROR_COPY } from "./global-error.copy";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// global-error.tsx replaces the root layout when it crashes, so it must include
// its own <html> and <body> tags (Next.js App Router requirement).
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
          <h1 className="text-2xl font-semibold">
            {GLOBAL_ERROR_COPY.heading}
          </h1>
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            {GLOBAL_ERROR_COPY.retryButton}
          </button>
        </main>
      </body>
    </html>
  );
}
