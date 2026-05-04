"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinGroup } from "@/services/groups";
import { JoinGroupFormView } from "./JoinGroupFormView";
import { JOIN_GROUP_COPY } from "./copy";

interface JoinGroupFormProps {
  token: string;
  groupId: string;
  groupName: string;
}

export function JoinGroupForm({ token, groupId, groupName }: JoinGroupFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleJoin() {
    setError(undefined);
    setLoading(true);
    try {
      await joinGroup(token);
      router.push(`/groups/${groupId}`);
    } catch {
      setError(JOIN_GROUP_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  return (
    <JoinGroupFormView
      groupName={groupName}
      onJoin={() => void handleJoin()}
      loading={loading}
      error={error}
    />
  );
}
