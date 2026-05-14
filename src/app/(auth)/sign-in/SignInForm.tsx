"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FirebaseError } from "firebase/app";
import {
  createSession,
  signIn,
  signInWithApple,
  signInWithGoogle,
} from "@/services/auth";
import { SIGN_IN_COPY } from "./copy";
import { SignInFormView } from "./SignInFormView";

const INVITE_TOKEN_FORMAT = /^[A-Za-z0-9_-]+$/;

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appleEnabled = process.env["NEXT_PUBLIC_APPLE_SSO_ENABLED"] === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const rawInviteToken = searchParams.get("invite_token");
  const inviteToken =
    rawInviteToken && INVITE_TOKEN_FORMAT.test(rawInviteToken)
      ? rawInviteToken
      : undefined;

  function getRedirectPath() {
    if (inviteToken) {
      return `/invite/${inviteToken}`;
    }
    const next = searchParams.get("next");
    return next?.startsWith("/") && !next.startsWith("//") ? next : "/";
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(undefined);
    setLoading(true);
    try {
      const credential = await signIn(email, password);
      await createSession(await credential.user.getIdToken());
      router.push(getRedirectPath());
    } catch (err) {
      const code = (err as FirebaseError).code;
      const messages = SIGN_IN_COPY.errors;
      setError((messages as Record<string, string>)[code] ?? messages.default);
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuthSignIn(providerSignIn: () => Promise<void>) {
    setError(undefined);
    setLoading(true);
    try {
      await providerSignIn();
      router.push(getRedirectPath());
    } catch (err) {
      const code = (err as FirebaseError).code;
      if (
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        return;
      }
      const messages = SIGN_IN_COPY.errors;
      setError((messages as Record<string, string>)[code] ?? messages.default);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SignInFormView
      email={email}
      onEmailChange={setEmail}
      password={password}
      onPasswordChange={setPassword}
      onSubmit={(e) => void handleSubmit(e)}
      onGoogleSignIn={() => void handleOAuthSignIn(signInWithGoogle)}
      onAppleSignIn={() => void handleOAuthSignIn(signInWithApple)}
      appleEnabled={appleEnabled}
      loading={loading}
      error={error}
      signUpHref={
        inviteToken ? `/sign-up?invite_token=${inviteToken}` : "/sign-up"
      }
    />
  );
}
