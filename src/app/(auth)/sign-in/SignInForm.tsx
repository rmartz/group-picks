"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { FirebaseError } from "firebase/app";
import {
  createSession,
  signIn,
  signInWithApple,
  signInWithGoogle,
} from "@/services/auth";
import { SIGN_IN_COPY } from "./copy";

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appleEnabled = process.env["NEXT_PUBLIC_APPLE_SSO_ENABLED"] === "true";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  function getRedirectPath() {
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
    <div className="w-full max-w-sm space-y-6">
      <h1 className="text-2xl font-semibold">{SIGN_IN_COPY.title}</h1>
      <button
        type="button"
        onClick={() => {
          void handleOAuthSignIn(signInWithGoogle);
        }}
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded border px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          className="h-4 w-4"
          aria-hidden="true"
        >
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
          <path fill="none" d="M0 0h48v48H0z" />
        </svg>
        {SIGN_IN_COPY.googleButton}
      </button>
      {appleEnabled && (
        <button
          type="button"
          onClick={() => {
            void handleOAuthSignIn(signInWithApple);
          }}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded border px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 814 1000"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-150.3-93.2c-52.3-65.3-95.9-166.3-95.9-262.6 0-175.1 114.4-267.3 227.2-267.3 59.7 0 109.4 39.5 147.2 39.5 35.8 0 92.1-42.2 160.9-42.2 25.9 0 108.2 2.6 168.1 80.1zm-128.5-111.3c26.5-31.7 45.4-75.8 45.4-119.9 0-6.1-.5-12.2-1.6-17.3-42.8 1.6-93.5 28.5-124.1 64.8-22.4 25.2-44.7 68.7-44.7 113.4 0 6.7 1.1 13.4 1.6 15.5 2.7.5 7 1.1 11.3 1.1 38.4 0 86.2-25.8 112.1-57.6z" />
          </svg>
          {SIGN_IN_COPY.appleButton}
        </button>
      )}
      <div className="flex items-center gap-3 text-sm text-gray-400">
        <hr className="flex-1" />
        {SIGN_IN_COPY.orDivider}
        <hr className="flex-1" />
      </div>
      <form
        onSubmit={(e) => {
          void handleSubmit(e);
        }}
        className="space-y-4"
      >
        <div className="space-y-1">
          <label htmlFor="email" className="text-sm font-medium">
            {SIGN_IN_COPY.emailLabel}
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
            placeholder={SIGN_IN_COPY.emailPlaceholder}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium">
            {SIGN_IN_COPY.passwordLabel}
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {SIGN_IN_COPY.submitButton}
        </button>
      </form>
      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="underline">
          {SIGN_IN_COPY.forgotPasswordLink}
        </Link>
        <span>
          {SIGN_IN_COPY.signUpPrompt}{" "}
          <Link href="/sign-up" className="underline">
            {SIGN_IN_COPY.signUpLink}
          </Link>
        </span>
      </div>
    </div>
  );
}
