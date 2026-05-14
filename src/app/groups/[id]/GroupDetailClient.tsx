"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Category } from "@/lib/types/category";
import type { Group } from "@/lib/types/group";
import type { GroupPick } from "@/lib/types/pick";
import { leaveGroup, LeaveGroupLastMemberError } from "@/services/groups";

import { GROUP_DETAIL_COPY } from "./copy";
import { GroupDetailView } from "./GroupDetailView";

interface GroupDetailClientProps {
  group: Group;
  categories: Category[];
  currentUserId: string;
  initialInviteExpiresAt?: string;
  memberNames: { uid: string; name: string }[];
  picksByCategory: Record<string, GroupPick[]>;
}

export function GroupDetailClient({
  group,
  categories,
  currentUserId,
  initialInviteExpiresAt,
  memberNames,
  picksByCategory,
}: GroupDetailClientProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleLeave() {
    setError(undefined);
    setIsLeaving(true);
    try {
      await leaveGroup(group.id);
      router.push("/");
    } catch (e) {
      setError(
        e instanceof LeaveGroupLastMemberError
          ? GROUP_DETAIL_COPY.errors.lastMember
          : GROUP_DETAIL_COPY.errors.default,
      );
    } finally {
      setIsLeaving(false);
    }
  }

  return (
    <GroupDetailView
      group={group}
      categories={categories}
      currentUserId={currentUserId}
      onLeave={() => {
        void handleLeave();
      }}
      isLeaving={isLeaving}
      leaveError={error}
      initialInviteExpiresAt={initialInviteExpiresAt}
      memberNames={memberNames}
      picksByCategory={picksByCategory}
    />
  );
}
