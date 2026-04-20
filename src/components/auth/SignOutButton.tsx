"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSession, signOut } from "@/services/auth";
import { SIGN_OUT_BUTTON_COPY } from "./SignOutButton.copy";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  async function handleSignOut() {
    setError(undefined);
    setLoading(true);
    try {
      const results = await Promise.allSettled([deleteSession(), signOut()]);
      const failed = results.some((r) => r.status === "rejected");
      if (failed) {
        setError(SIGN_OUT_BUTTON_COPY.error);
        return;
      }
      router.push("/sign-in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          void handleSignOut();
        }}
        disabled={loading}
        className="rounded border px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {SIGN_OUT_BUTTON_COPY.button}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
