"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import type { InviteMode } from "@/lib/types/invite";
import { regenerateInvite } from "@/services/groups";

import { GROUP_DETAIL_COPY } from "./copy";
import { InviteSectionView } from "./InviteSectionView";

interface InviteSectionProps {
  groupId: string;
  initialToken: string;
  initialExpiresAt?: string;
  initialMode: InviteMode;
}

// The page origin never changes while the page is loaded.
function subscribeToNothing() {
  return () => undefined;
}

export function InviteSection({
  groupId,
  initialToken,
  initialExpiresAt,
  initialMode,
}: InviteSectionProps) {
  const [token, setToken] = useState(initialToken);
  // The origin only exists in the browser; the server snapshot keeps the
  // first client render matching the server-rendered HTML.
  const origin = useSyncExternalStore(
    subscribeToNothing,
    () => window.location.origin,
    () => "",
  );
  const [expiresAt, setExpiresAt] = useState(
    initialExpiresAt ? new Date(initialExpiresAt) : undefined,
  );
  const [mode, setMode] = useState<InviteMode>(initialMode);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== undefined) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const inviteUrl = origin ? `${origin}/invite/${token}` : undefined;

  async function handleRegenerate() {
    setError(undefined);
    setRegenerating(true);
    try {
      const result = await regenerateInvite(groupId, mode);
      setToken(result.token);
      setExpiresAt(new Date(result.expiresAt));
      setMode(result.mode);
      setCopied(false);
    } catch {
      setError(GROUP_DETAIL_COPY.inviteErrors.default);
    } finally {
      setRegenerating(false);
    }
  }

  async function handleCopy() {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      if (copyTimeoutRef.current !== undefined) {
        clearTimeout(copyTimeoutRef.current);
      }
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
        copyTimeoutRef.current = undefined;
      }, 2000);
    } catch {
      setError(GROUP_DETAIL_COPY.inviteErrors.default);
    }
  }

  return (
    <InviteSectionView
      inviteUrl={inviteUrl}
      expiresAt={expiresAt}
      mode={mode}
      onModeChange={setMode}
      onRegenerate={() => void handleRegenerate()}
      onCopy={() => void handleCopy()}
      regenerating={regenerating}
      copied={copied}
      error={error}
    />
  );
}
