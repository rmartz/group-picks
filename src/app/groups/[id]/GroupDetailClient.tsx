"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Category } from "@/lib/types/category";
import type { Group } from "@/lib/types/group";
import { InviteMode } from "@/lib/types/invite";
import type { GroupPick } from "@/lib/types/pick";
import {
  leaveGroup,
  LeaveGroupLastMemberError,
  promoteAdmin,
  revokeAdmin,
} from "@/services/groups";

import { GROUP_DETAIL_COPY } from "./copy";
import { GroupDetailView } from "./GroupDetailView";

interface GroupDetailClientProps {
  group: Group;
  categories: Category[];
  currentUserId: string;
  initialInviteExpiresAt?: string;
  initialInviteMode: InviteMode;
  memberNames: { uid: string; name: string }[];
  picksByCategory: Record<string, GroupPick[]>;
}

export function GroupDetailClient({
  group,
  categories,
  currentUserId,
  initialInviteExpiresAt,
  initialInviteMode,
  memberNames,
  picksByCategory,
}: GroupDetailClientProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [adminError, setAdminError] = useState<string | undefined>();

  async function handleMakeAdmin(uid: string) {
    setAdminError(undefined);
    try {
      await promoteAdmin(group.id, uid);
      router.refresh();
    } catch {
      setAdminError(GROUP_DETAIL_COPY.errors.adminAction);
    }
  }

  async function handleRevokeAdmin(uid: string) {
    setAdminError(undefined);
    try {
      await revokeAdmin(group.id, uid);
      router.refresh();
    } catch {
      setAdminError(GROUP_DETAIL_COPY.errors.adminAction);
    }
  }

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
      onMakeAdmin={(uid) => {
        void handleMakeAdmin(uid);
      }}
      onRevokeAdmin={(uid) => {
        void handleRevokeAdmin(uid);
      }}
      adminError={adminError}
      isLeaving={isLeaving}
      leaveError={error}
      initialInviteExpiresAt={initialInviteExpiresAt}
      initialInviteMode={initialInviteMode}
      memberNames={memberNames}
      picksByCategory={picksByCategory}
    />
  );
}
