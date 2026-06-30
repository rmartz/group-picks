import type { Group } from "@/lib/types/group";

export interface GroupWithActivity extends Group {
  activityPreview?: string;
  unreadCount: number;
}
