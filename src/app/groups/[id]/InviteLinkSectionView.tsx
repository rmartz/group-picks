"use client";

import { GROUP_DETAIL_COPY } from "./copy";

interface InviteLinkSectionViewProps {
  inviteUrl: string;
  expiresAt: string | null;
  expiryInput: string;
  copied: boolean;
  loading: boolean;
  error: string | undefined;
  onCopy: () => void;
  onExpiryChange: (value: string) => void;
  onSave: () => void;
  onClearExpiry: () => void;
}

export function InviteLinkSectionView({
  inviteUrl,
  expiresAt,
  expiryInput,
  copied,
  loading,
  error,
  onCopy,
  onExpiryChange,
  onSave,
  onClearExpiry,
}: InviteLinkSectionViewProps) {
  const isExpired = expiresAt !== null && new Date(expiresAt) < new Date();

  return (
    <section className="space-y-3 rounded border p-4 text-sm">
      <h2 className="font-semibold">{GROUP_DETAIL_COPY.inviteTitle}</h2>

      <div className="flex items-center gap-2">
        <input
          readOnly
          value={inviteUrl}
          aria-label={GROUP_DETAIL_COPY.inviteTitle}
          className="flex-1 truncate rounded border bg-gray-50 px-3 py-1.5 text-sm"
        />
        <button
          type="button"
          onClick={onCopy}
          className="rounded bg-black px-3 py-1.5 text-sm font-medium text-white"
        >
          {copied
            ? GROUP_DETAIL_COPY.inviteCopiedButton
            : GROUP_DETAIL_COPY.inviteCopyButton}
        </button>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span className="font-medium">
          {GROUP_DETAIL_COPY.inviteExpiresAtLabel}:
        </span>
        {expiresAt === null ? (
          <span>{GROUP_DETAIL_COPY.inviteExpiresNever}</span>
        ) : (
          <span>
            {new Date(expiresAt).toLocaleDateString()}
            {isExpired && (
              <span className="ml-1 rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-700">
                {GROUP_DETAIL_COPY.inviteExpiredBadge}
              </span>
            )}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <label className="block font-medium" htmlFor="invite-expiry-date">
          {GROUP_DETAIL_COPY.inviteExpiryDateLabel}
        </label>
        <div className="flex items-center gap-2">
          <input
            id="invite-expiry-date"
            type="date"
            value={expiryInput}
            onChange={(e) => {
              onExpiryChange(e.target.value);
            }}
            className="rounded border px-3 py-1.5 text-sm"
          />
          {expiryInput && (
            <button
              type="button"
              onClick={onClearExpiry}
              className="text-sm text-gray-500 underline"
            >
              {GROUP_DETAIL_COPY.inviteClearExpiry}
            </button>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={onSave}
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading
          ? GROUP_DETAIL_COPY.inviteSavingButton
          : GROUP_DETAIL_COPY.inviteSaveButton}
      </button>
    </section>
  );
}
