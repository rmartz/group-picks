"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { JOIN_GROUP_COPY } from "@/app/groups/join/copy";
import { deleteSession, signOut } from "@/services/auth";
import { joinGroup } from "@/services/groups";

import { InviteLandingView } from "./InviteLandingView";

interface InviteLandingProps {
  token: string;
  groupName: string;
  memberCount: number;
  memberNames: string[];
  currentPickTitle?: string;
  signInHref: string;
}

export function InviteLanding({
  token,
  groupName,
  memberCount,
  memberNames,
  currentPickTitle,
  signInHref,
}: InviteLandingProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleJoin() {
    setError(undefined);
    setIsJoining(true);
    try {
      const joinedGroupId = await joinGroup(token);
      router.push(`/groups/${joinedGroupId}`);
    } catch {
      setError(JOIN_GROUP_COPY.errors.default);
    } finally {
      setIsJoining(false);
    }
  }

  async function handleSignInDifferentAccount() {
    setError(undefined);
    setIsSigningIn(true);
    try {
      const results = await Promise.allSettled([deleteSession(), signOut()]);
      const failed = results.some((r) => r.status === "rejected");
      if (failed) {
        setError(JOIN_GROUP_COPY.errors.default);
        return;
      }
      router.push(signInHref);
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <InviteLandingView
      groupName={groupName}
      memberCount={memberCount}
      memberNames={memberNames}
      currentPickTitle={currentPickTitle}
      onJoin={() => void handleJoin()}
      isJoining={isJoining || isSigningIn}
      error={error}
      onSignInDifferentAccount={() => void handleSignInDifferentAccount()}
    />
  );
}
