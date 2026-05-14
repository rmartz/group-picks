"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { ErrorView } from "@/app/ErrorView";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <ErrorView onReset={reset} />;
}
