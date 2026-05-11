"use client";

import { useEffect, useRef, useState } from "react";
import { regenerateInvite } from "@/services/groups";
import { InviteSectionView } from "./InviteSectionView";
import { GROUP_DETAIL_COPY } from "./copy";

interface InviteSectionProps {
  groupId: string;
  initialToken: string;
}

export function InviteSection({ groupId, initialToken }: InviteSectionProps) {
  const [token, setToken] = useState(initialToken);
  const [origin, setOrigin] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    setOrigin(window.location.origin);
    return () => {
      clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const inviteUrl = origin ? `${origin}/invite/${token}` : undefined;

  async function handleRegenerate() {
    setError(undefined);
    setRegenerating(true);
    try {
      const newToken = await regenerateInvite(groupId);
      setToken(newToken);
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
      clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setError(GROUP_DETAIL_COPY.inviteErrors.default);
    }
  }

  return (
    <InviteSectionView
      inviteUrl={inviteUrl}
      onRegenerate={() => void handleRegenerate()}
      onCopy={() => void handleCopy()}
      regenerating={regenerating}
      copied={copied}
      error={error}
    />
  );
}
