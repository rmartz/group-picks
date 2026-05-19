"use client";

import { useEffect, useRef, useState } from "react";

import { InviteMode } from "@/lib/types/invite";
import { regenerateInvite } from "@/services/groups";

import { GROUP_DETAIL_COPY } from "./copy";
import { InviteSectionView } from "./InviteSectionView";

interface InviteSectionProps {
  groupId: string;
  initialToken: string;
  initialExpiresAt?: string;
  initialMode: InviteMode;
}

export function InviteSection({
  groupId,
  initialToken,
  initialExpiresAt,
  initialMode,
}: InviteSectionProps) {
  const [token, setToken] = useState(initialToken);
  const [origin, setOrigin] = useState("");
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
    setOrigin(window.location.origin);
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
