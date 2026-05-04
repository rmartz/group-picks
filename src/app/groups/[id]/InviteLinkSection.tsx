"use client";

import { useEffect, useRef, useState } from "react";
import { GROUP_DETAIL_COPY } from "./copy";

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
    <div className="flex gap-2">
      <dt className="font-medium">{GROUP_DETAIL_COPY.inviteLinkLabel}:</dt>
      <dd className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm text-gray-500">{inviteUrl}</span>
        <button
          className="shrink-0 rounded border px-2 py-1 text-xs font-medium"
          onClick={() => void handleCopy()}
        >
          {copied ? GROUP_DETAIL_COPY.copied : GROUP_DETAIL_COPY.copyLink}
        </button>
      </dd>
    </div>
  );
}
