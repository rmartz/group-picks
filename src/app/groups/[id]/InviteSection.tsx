"use client";

import { useEffect, useRef, useState } from "react";
import { regenerateInvite } from "@/services/groups";
import { InviteSectionView } from "./InviteSectionView";
import { GROUP_DETAIL_COPY } from "./copy";

interface InviteSectionProps {
  groupId: string;
  initialToken: string;
  initialExpiresAt?: string;
}

export function InviteSection({
  groupId,
  initialToken,
  initialExpiresAt,
}: InviteSectionProps) {
  const [token, setToken] = useState(initialToken);
  const [origin, setOrigin] = useState("");
  const [expiresAt, setExpiresAt] = useState(
    initialExpiresAt ? new Date(initialExpiresAt) : undefined,
  );
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
      const result = await regenerateInvite(groupId);
      setToken(result.token);
      setExpiresAt(new Date(result.expiresAt));
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
      onRegenerate={() => void handleRegenerate()}
      onCopy={() => void handleCopy()}
      regenerating={regenerating}
      copied={copied}
      error={error}
    />
  );
}
