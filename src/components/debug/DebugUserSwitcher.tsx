"use client";

import { useState } from "react";

import { DEBUG_PROFILES, isDebugAuthEnabled } from "@/lib/debug/profiles";
import { debugSignIn } from "@/services/debug-auth";

import { DEBUG_SWITCHER_COPY } from "./DebugUserSwitcher.copy";
import { DebugUserSwitcherView } from "./DebugUserSwitcherView";

export function DebugUserSwitcher() {
  const [loadingId, setLoadingId] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  if (!isDebugAuthEnabled()) return null;

  async function handleSelect(id: string) {
    if (loadingId !== undefined) return;
    setLoadingId(id);
    setError(undefined);
    try {
      await debugSignIn(id);
      window.location.assign("/");
    } catch {
      setError(DEBUG_SWITCHER_COPY.error);
      setLoadingId(undefined);
    }
  }

  return (
    <DebugUserSwitcherView
      error={error}
      loadingId={loadingId}
      onSelect={(id) => {
        void handleSelect(id);
      }}
      profiles={DEBUG_PROFILES}
    />
  );
}
