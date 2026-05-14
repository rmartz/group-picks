"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { deleteSession, signOut } from "@/services/auth";
import { joinGroup } from "@/services/groups";

import { JOIN_GROUP_COPY } from "./copy";
import { JoinGroupFormView } from "./JoinGroupFormView";

interface JoinGroupFormProps {
  token: string;
  groupName: string;
  signInHref: string;
}

export function JoinGroupForm({
  token,
  groupName,
  signInHref,
}: JoinGroupFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleJoin() {
    setError(undefined);
    setLoading(true);
    try {
      const joinedGroupId = await joinGroup(token);
      router.push(`/groups/${joinedGroupId}`);
    } catch {
      setError(JOIN_GROUP_COPY.errors.default);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignInDifferentAccount() {
    await Promise.allSettled([deleteSession(), signOut()]);
    router.push(signInHref);
  }

  return (
    <JoinGroupFormView
      groupName={groupName}
      onJoin={() => void handleJoin()}
      loading={loading}
      error={error}
      onSignInDifferentAccount={() => void handleSignInDifferentAccount()}
    />
  );
}
