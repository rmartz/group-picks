"use client";

import { useEffect, useRef, useState } from "react";
import { InviteLinkSectionView } from "./InviteLinkSectionView";

interface InviteLinkSectionProps {
  inviteToken: string;
}

export function InviteLinkSection({ inviteToken }: InviteLinkSectionProps) {
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    setInviteUrl(`${window.location.origin}/invite/${inviteToken}`);
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [inviteToken]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // clipboard access denied — silently ignore
    }
  }

  return (
    <InviteLinkSectionView
      inviteUrl={inviteUrl}
      copied={copied}
      onCopy={() => void handleCopy()}
    />
  );
}
