"use client";

import { useState } from "react";
import { setInviteExpiry } from "@/services/invites";
import { InviteLinkSectionView } from "./InviteLinkSectionView";
import { GROUP_DETAIL_COPY } from "./copy";

interface InviteLinkSectionProps {
  groupId: string;
  token: string;
  initialExpiresAt: string | null;
}

function toDateInputValue(isoString: string | null): string {
  if (!isoString) return "";
  return isoString.slice(0, 10);
}

export function InviteLinkSection({
  groupId,
  token,
  initialExpiresAt,
}: InviteLinkSectionProps) {
  const [expiresAt, setExpiresAt] = useState<string | null>(initialExpiresAt);
  const [expiryInput, setExpiryInput] = useState(
    toDateInputValue(initialExpiresAt),
  );
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/groups/join?token=${token}`
      : `/groups/join?token=${token}`;

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl).then(
      () => {
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, 2000);
      },
      () => {
        setError(GROUP_DETAIL_COPY.errors.copyFailed);
      },
    );
  }

  async function handleSave() {
    setError(undefined);
    setLoading(true);
    try {
      const newExpiresAt = expiryInput
        ? new Date(`${expiryInput}T23:59:59`).toISOString()
        : null;
      await setInviteExpiry(groupId, newExpiresAt);
      setExpiresAt(newExpiresAt);
    } catch {
      setError(GROUP_DETAIL_COPY.errors.saveFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <InviteLinkSectionView
      inviteUrl={inviteUrl}
      expiresAt={expiresAt}
      expiryInput={expiryInput}
      copied={copied}
      loading={loading}
      error={error}
      onCopy={handleCopy}
      onExpiryChange={setExpiryInput}
      onSave={() => void handleSave()}
      onClearExpiry={() => {
        setExpiryInput("");
      }}
    />
  );
}
