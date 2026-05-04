"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { INVITE_COPY } from "./copy";

interface InviteViewProps {
  groupId: string;
  groupName: string;
  token: string;
  isMember: boolean;
}

export function InviteView({
  groupId,
  groupName,
  token,
  isMember,
}: InviteViewProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleJoin() {
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(`/api/invite/${token}/join`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to join");
      router.push(`/groups/${groupId}`);
    } catch {
      setError(INVITE_COPY.error);
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 rounded-lg border p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">{INVITE_COPY.heading}</h1>
        <p className="text-sm text-gray-600">
          You have been invited to join{" "}
          <span className="font-medium text-gray-900">{groupName}</span>.
        </p>
        {isMember ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">{INVITE_COPY.alreadyMember}</p>
            <button
              className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white"
              onClick={() => {
                router.push(`/groups/${groupId}`);
              }}
            >
              {INVITE_COPY.viewGroup}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              onClick={() => void handleJoin()}
              disabled={loading}
            >
              {loading ? INVITE_COPY.joining : INVITE_COPY.joinButton}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
