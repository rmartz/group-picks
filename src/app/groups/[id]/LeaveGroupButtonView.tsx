import { GROUP_DETAIL_COPY } from "./copy";

interface LeaveGroupButtonViewProps {
  onLeave: () => void;
  isLeaving: boolean;
  error: string | undefined;
}

export function LeaveGroupButtonView({
  onLeave,
  isLeaving,
  error,
}: LeaveGroupButtonViewProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onLeave}
        disabled={isLeaving}
        className="rounded border px-4 py-2 text-sm font-medium text-red-600 disabled:opacity-50"
      >
        {GROUP_DETAIL_COPY.leaveButton}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
