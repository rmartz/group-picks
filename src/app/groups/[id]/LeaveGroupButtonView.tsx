import { Button } from "@/components/ui/button";

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
      <Button
        type="button"
        variant="destructive"
        onClick={onLeave}
        disabled={isLeaving}
      >
        {GROUP_DETAIL_COPY.leaveButton}
      </Button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
