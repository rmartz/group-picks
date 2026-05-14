"use client";

import type { Group } from "@/lib/types/group";
import type { Category } from "@/lib/types/category";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { leaveGroup, LeaveGroupLastMemberError } from "@/services/groups";
import { GroupDetailView } from "./GroupDetailView";
import { GROUP_DETAIL_COPY } from "./copy";

interface GroupDetailClientProps {
  group: Group;
  categories: Category[];
  currentUserId: string;
  initialInviteExpiresAt?: string;
}

export function GroupDetailClient({
  group,
  categories,
  currentUserId,
  initialInviteExpiresAt,
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
    />
  );
}
