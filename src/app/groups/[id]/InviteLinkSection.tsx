"use client";

import { useState } from "react";
import { GROUP_DETAIL_COPY } from "./copy";

interface InviteLinkSectionProps {
  inviteToken: string;
}

export function InviteLinkSection({ inviteToken }: InviteLinkSectionProps) {
  const [copied, setCopied] = useState(false);

  const inviteUrl = `${window.location.origin}/invite/${inviteToken}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
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
