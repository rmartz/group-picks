"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { leaveGroup, LeaveGroupLastMemberError } from "@/services/groups";
import { LeaveGroupButtonView } from "./LeaveGroupButtonView";
import { GROUP_DETAIL_COPY } from "./copy";

interface LeaveGroupButtonProps {
  groupId: string;
}

export function LeaveGroupButton({ groupId }: LeaveGroupButtonProps) {
  const router = useRouter();
  const [isLeaving, setIsLeaving] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleLeave() {
    setError(undefined);
    setIsLeaving(true);
    try {
      await leaveGroup(groupId);
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
    <LeaveGroupButtonView
      onLeave={() => {
        void handleLeave();
      }}
      isLeaving={isLeaving}
      error={error}
    />
  );
}
