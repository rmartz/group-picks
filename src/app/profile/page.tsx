"use client";

import { useAuth } from "@/hooks/use-auth";
import { updateDisplayName } from "@/services/auth";
import { UserProfileView } from "./UserProfileView";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <UserProfileView
        initialDisplayName={user.displayName ?? ""}
        providerIds={user.providerData.map((p) => p.providerId)}
        onSave={updateDisplayName}
      />
    </main>
  );
}
