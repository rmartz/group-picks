"use client";

import { useEffect, useRef, useState } from "react";

import { regenerateInvite, updateInviteExpiry } from "@/services/groups";

import { GROUP_DETAIL_COPY } from "./copy";
import { InviteSectionView } from "./InviteSectionView";

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
  const [dateInput, setDateInput] = useState(
    initialExpiresAt ? new Date(initialExpiresAt).toISOString().slice(0, 10) : "",
  );
  const [regenerating, setRegenerating] = useState(false);
  const [settingExpiry, setSettingExpiry] = useState(false);
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
      const newExpiresAt = new Date(result.expiresAt);
      setExpiresAt(newExpiresAt);
      setDateInput(newExpiresAt.toISOString().slice(0, 10));
      setCopied(false);
    } catch {
      setError(GROUP_DETAIL_COPY.inviteErrors.default);
    } finally {
      setRegenerating(false);
    }
  }

  async function handleSetExpiry(date: string | null) {
    setError(undefined);
    setSettingExpiry(true);
    try {
      const result = await updateInviteExpiry(groupId, date);
      setExpiresAt(
        result.expiresAt !== null ? new Date(result.expiresAt) : undefined,
      );
    } catch {
      setError(GROUP_DETAIL_COPY.inviteErrors.default);
    } finally {
      setSettingExpiry(false);
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
      dateInput={dateInput}
      onDateChange={setDateInput}
      onRegenerate={() => void handleRegenerate()}
      onCopy={() => void handleCopy()}
      onSetExpiry={(date) => void handleSetExpiry(date)}
      regenerating={regenerating}
      settingExpiry={settingExpiry}
      copied={copied}
      error={error}
    />
  );
}
