"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSession, signOut } from "@/services/auth";
import { SIGN_OUT_BUTTON_COPY } from "./SignOutButton.copy";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    try {
      await deleteSession();
      await signOut();
      router.push("/sign-in");
    } finally {
      setLoading(false);
    }
  }

  return (
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
  );
}
