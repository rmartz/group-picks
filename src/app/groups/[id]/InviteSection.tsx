"use client";

import { useState } from "react";
import { regenerateInvite } from "@/services/groups";
import { InviteSectionView } from "./InviteSectionView";
import { GROUP_DETAIL_COPY } from "./copy";

interface InviteSectionProps {
  groupId: string;
  initialToken: string | undefined;
  origin: string;
}

export function InviteSection({
  groupId,
  initialToken,
  origin,
}: InviteSectionProps) {
  const [token, setToken] = useState(initialToken);
  const [regenerating, setRegenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const inviteUrl = token ? `${origin}/groups/join?token=${token}` : undefined;

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
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
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
