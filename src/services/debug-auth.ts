import { signInWithCustomToken } from "firebase/auth";

import { getClientAuth } from "@/lib/firebase/client";

import { createSession } from "./auth";

// Preview/staging-only: exchange a debug profile id for a Firebase custom
// token, sign in with it, then establish the normal session cookie — the same
// path OAuth/email sign-in uses, just without the provider UI (#319).
export async function debugSignIn(profileId: string): Promise<void> {
  const response = await fetch("/api/auth/debug-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ profileId }),
  });
  if (!response.ok) throw new Error("Failed to start debug session");

  const { customToken } = (await response.json()) as { customToken: string };
  const credential = await signInWithCustomToken(getClientAuth(), customToken);
  await createSession(await credential.user.getIdToken());
}
