"use client";

import { useAuth } from "@/hooks/use-auth";
import { updateDisplayName } from "@/services/auth";
import { UserProfileView } from "./UserProfileView";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) return null;

  const providerIds = user.providerData.map((p) => p.providerId);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <UserProfileView
        initialDisplayName={user.displayName ?? ""}
        providerIds={providerIds}
        onSave={updateDisplayName}
      />
    </main>
  );
}
