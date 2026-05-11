import { GROUP_DETAIL_COPY } from "./copy";

interface InviteLinkSectionViewProps {
  inviteUrl: string;
  copied: boolean;
  onCopy: () => void;
}

export function InviteLinkSectionView({
  inviteUrl,
  copied,
  onCopy,
}: InviteLinkSectionViewProps) {
  return (
    <div className="flex gap-2">
      <dt className="font-medium">{GROUP_DETAIL_COPY.inviteLinkLabel}:</dt>
      <dd className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate text-sm text-gray-500">{inviteUrl}</span>
        <button
          className="shrink-0 rounded border px-2 py-1 text-xs font-medium"
          onClick={onCopy}
        >
          {copied ? GROUP_DETAIL_COPY.copied : GROUP_DETAIL_COPY.copyLink}
        </button>
      </dd>
    </div>
  );
}
