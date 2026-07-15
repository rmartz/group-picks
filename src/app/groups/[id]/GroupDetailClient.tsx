"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Category } from "@/lib/types/category";
import type { Group } from "@/lib/types/group";
import type { InviteMode } from "@/lib/types/invite";
import type { GroupPick } from "@/lib/types/pick";
import type { ActiveSnapPickActivation } from "@/lib/types/snap-pick";
import {
  deleteGroup,
  leaveGroup,
  LeaveGroupLastMemberError,
  promoteAdmin,
  removeGroupMember,
  revokeAdmin,
  updateGroupSettings,
} from "@/services/groups";

import { GROUP_DETAIL_COPY } from "./copy";
import { GroupDetailView } from "./GroupDetailView";
import type { MemberName } from "./MemberRow";

interface GroupDetailClientProps {
  group: Group;
  categories: Category[];
  currentUserId: string;
  initialInviteExpiresAt?: string;
  initialInviteMode: InviteMode;
  memberNames: MemberName[];
  picksByCategory: Record<string, GroupPick[]>;
  activeSnapPicks: ActiveSnapPickActivation[];
}

export function GroupDetailClient({
  group,
  categories,
  currentUserId,
  initialInviteExpiresAt,
  initialInviteMode,
  memberNames,
  picksByCategory,
  activeSnapPicks,
}: GroupDetailClientProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState<string | undefined>();
  const [adminError, setAdminError] = useState<string | undefined>();
  const [picksRestricted, setPicksRestricted] = useState(group.picksRestricted);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | undefined>();
  const [removeMemberError, setRemoveMemberError] = useState<
    string | undefined
  >();
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [deleteGroupError, setDeleteGroupError] = useState<
    string | undefined
  >();

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

  async function handleRemoveMember(uid: string) {
    setRemoveMemberError(undefined);
    try {
      await removeGroupMember(group.id, uid);
      router.refresh();
    } catch {
      setRemoveMemberError(GROUP_DETAIL_COPY.removeMemberError);
    }
  }

  async function handleLeave() {
    setLeaveError(undefined);
    setIsLeaving(true);
    try {
      await leaveGroup(group.id);
      router.push("/");
    } catch (e) {
      setLeaveError(
        e instanceof LeaveGroupLastMemberError
          ? GROUP_DETAIL_COPY.errors.lastMember
          : GROUP_DETAIL_COPY.errors.default,
      );
    } finally {
      setIsLeaving(false);
    }
  }

  async function handleTogglePicksRestricted() {
    setSettingsError(undefined);
    setIsSavingSettings(true);
    try {
      const newValue = !picksRestricted;
      await updateGroupSettings(group.id, { picksRestricted: newValue });
      setPicksRestricted(newValue);
    } catch {
      setSettingsError(GROUP_DETAIL_COPY.settings.error);
    } finally {
      setIsSavingSettings(false);
    }
  }

  async function handleDeleteGroup() {
    setDeleteGroupError(undefined);
    setIsDeletingGroup(true);
    try {
      await deleteGroup(group.id);
      router.push("/");
    } catch {
      setDeleteGroupError(GROUP_DETAIL_COPY.deleteGroupError);
    } finally {
      setIsDeletingGroup(false);
    }
  }

  return (
    <GroupDetailView
      group={{ ...group, picksRestricted }}
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
      onRemoveMember={(uid) => {
        void handleRemoveMember(uid);
      }}
      adminError={adminError}
      isLeaving={isLeaving}
      leaveError={leaveError}
      removeMemberError={removeMemberError}
      initialInviteExpiresAt={initialInviteExpiresAt}
      initialInviteMode={initialInviteMode}
      memberNames={memberNames}
      picksByCategory={picksByCategory}
      activeSnapPicks={activeSnapPicks}
      onTogglePicksRestricted={() => {
        void handleTogglePicksRestricted();
      }}
      isSavingSettings={isSavingSettings}
      settingsError={settingsError}
      onDeleteGroup={() => {
        void handleDeleteGroup();
      }}
      isDeletingGroup={isDeletingGroup}
      deleteGroupError={deleteGroupError}
    />
  );
}
