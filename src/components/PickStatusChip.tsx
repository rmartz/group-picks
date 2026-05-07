import { PickStatus } from "@/lib/types/pick";
import { PICK_STATUS_CHIP_COPY } from "./PickStatusChip.copy";

export interface PickStatusChipProps {
  status: PickStatus;
}

export function PickStatusChip({ status }: PickStatusChipProps) {
  if (status === PickStatus.Open) {
    return (
      <span className="inline-flex shrink-0 items-center rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
        ● {PICK_STATUS_CHIP_COPY.statusOpen}
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
      {PICK_STATUS_CHIP_COPY.statusClosed}
    </span>
  );
}
