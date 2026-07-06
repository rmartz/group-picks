"use client";

import { useEffect, useState } from "react";

import type { Category } from "@/lib/types/category";
import type { SnapPick, SnapPickActivation } from "@/lib/types/snap-pick";

import { ACTIVE_SNAP_PICK_LIST_COPY } from "./ActiveSnapPickList.copy";
import {
  type ActiveSnapPickListItem,
  ActiveSnapPickListView,
} from "./ActiveSnapPickListView";

export interface ActiveSnapPickActivationItem {
  snapPick: SnapPick;
  activation: SnapPickActivation;
}

interface ActiveSnapPickListProps {
  groupId: string;
  activations: ActiveSnapPickActivationItem[];
  categories: Category[];
}

function formatTimeRemaining(closesAt: Date, now: Date): string {
  const remainingMs = closesAt.getTime() - now.getTime();
  if (remainingMs <= 0) return ACTIVE_SNAP_PICK_LIST_COPY.closingNow;

  const totalMinutes = Math.floor(remainingMs / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const label =
    hours > 0 ? `${String(hours)}h ${String(minutes)}m` : `${String(minutes)}m`;
  return ACTIVE_SNAP_PICK_LIST_COPY.timeRemaining(label);
}

export function ActiveSnapPickList({
  groupId,
  activations,
  categories,
}: ActiveSnapPickListProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

  const items: ActiveSnapPickListItem[] = activations
    .filter(({ activation }) => activation.closesAt.getTime() > now.getTime())
    .map(({ snapPick, activation }) => ({
      activationId: activation.id,
      title: snapPick.title,
      categoryName: categoryById[snapPick.categoryId]?.name,
      timeRemainingLabel: formatTimeRemaining(activation.closesAt, now),
      isClosingSoon:
        activation.closesAt.getTime() - now.getTime() <= 60 * 60 * 1000,
      href: `/groups/${groupId}/categories/${snapPick.categoryId}/snap-picks/${snapPick.id}`,
    }));

  return <ActiveSnapPickListView items={items} />;
}
