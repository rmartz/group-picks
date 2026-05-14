import { GROUP_DETAIL_COPY } from "./copy";

interface InviteSectionViewProps {
  inviteUrl: string | undefined;
  expiresAt: Date | undefined;
  onRegenerate: () => void;
  onCopy: () => void;
  regenerating: boolean;
  copied: boolean;
  error: string | undefined;
}

export function InviteSectionView({
  inviteUrl,
  expiresAt,
  onRegenerate,
  onCopy,
  regenerating,
  copied,
  error,
}: InviteSectionViewProps) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-medium">{GROUP_DETAIL_COPY.inviteLabel}</h2>
      {inviteUrl && (
        <div className="flex gap-2">
          <input
            readOnly
            value={inviteUrl}
            aria-label={GROUP_DETAIL_COPY.inviteLabel}
            className="min-w-0 flex-1 rounded border px-2 py-1 text-sm"
          />
          <button
            type="button"
            onClick={onCopy}
            className="rounded border px-3 py-1 text-sm font-medium"
          >
            {copied
              ? GROUP_DETAIL_COPY.copiedButton
              : GROUP_DETAIL_COPY.copyButton}
          </button>
        </div>
      )}
      {expiresAt && (
        <p className="text-xs text-gray-500">
          <span className="font-medium">
            {GROUP_DETAIL_COPY.expiresAtLabel}
          </span>
          {": "}
          <time dateTime={expiresAt.toISOString()}>
            {expiresAt.toLocaleDateString()}
          </time>
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={onRegenerate}
        disabled={regenerating}
        className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {regenerating
          ? GROUP_DETAIL_COPY.regeneratingButton
          : inviteUrl
            ? GROUP_DETAIL_COPY.regenerateButton
            : GROUP_DETAIL_COPY.generateButton}
      </button>
    </section>
  );
}
