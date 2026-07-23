import { describe, expect, it } from "vitest";

import { FORGOT_PASSWORD_COPY } from "@/app/(auth)/forgot-password/copy";
import { SIGN_IN_COPY } from "@/app/(auth)/sign-in/copy";
import { SIGN_UP_COPY } from "@/app/(auth)/sign-up/copy";

import {
  firebaseAuthErrorMessage,
  normalizeFirebaseAuthCode,
} from "./auth-error";

describe("normalizeFirebaseAuthCode", () => {
  it("maps a raw Identity Toolkit code to its auth/* SDK equivalent", () => {
    expect(normalizeFirebaseAuthCode("EMAIL_EXISTS")).toBe(
      "auth/email-already-in-use",
    );
  });

  it("returns an auth/* SDK code unchanged", () => {
    expect(normalizeFirebaseAuthCode("auth/email-already-in-use")).toBe(
      "auth/email-already-in-use",
    );
  });

  it("returns an unrecognized code unchanged", () => {
    expect(normalizeFirebaseAuthCode("auth/some-future-code")).toBe(
      "auth/some-future-code",
    );
  });
});

describe("firebaseAuthErrorMessage raw-vs-SDK reconciliation", () => {
  it("resolves the same message for the raw EMAIL_EXISTS code and the SDK code", () => {
    const fromSdk = firebaseAuthErrorMessage(
      "auth/email-already-in-use",
      SIGN_UP_COPY.errors,
    );
    const fromRaw = firebaseAuthErrorMessage(
      "EMAIL_EXISTS",
      SIGN_UP_COPY.errors,
    );
    expect(fromRaw).toBe(fromSdk);
    expect(fromRaw).toBe(SIGN_UP_COPY.errors["auth/email-already-in-use"]);
  });

  it("resolves the weak-password message for the raw WEAK_PASSWORD code", () => {
    expect(firebaseAuthErrorMessage("WEAK_PASSWORD", SIGN_UP_COPY.errors)).toBe(
      SIGN_UP_COPY.errors["auth/weak-password"],
    );
  });
});

describe("firebaseAuthErrorMessage per-surface coverage", () => {
  it("maps sign-up too-many-requests to its specific message", () => {
    expect(
      firebaseAuthErrorMessage("auth/too-many-requests", SIGN_UP_COPY.errors),
    ).toBe(SIGN_UP_COPY.errors["auth/too-many-requests"]);
  });

  it("maps the OAuth account-collision code on the sign-in surface", () => {
    expect(
      firebaseAuthErrorMessage(
        "auth/account-exists-with-different-credential",
        SIGN_IN_COPY.errors,
      ),
    ).toBe(
      SIGN_IN_COPY.errors["auth/account-exists-with-different-credential"],
    );
  });

  it("maps forgot-password missing-email to its specific message", () => {
    expect(
      firebaseAuthErrorMessage(
        "auth/missing-email",
        FORGOT_PASSWORD_COPY.errors,
      ),
    ).toBe(FORGOT_PASSWORD_COPY.errors["auth/missing-email"]);
  });
});

describe("firebaseAuthErrorMessage default fallback", () => {
  it("falls back to the surface default for an unknown code", () => {
    expect(
      firebaseAuthErrorMessage("auth/totally-unknown", SIGN_UP_COPY.errors),
    ).toBe(SIGN_UP_COPY.errors.default);
  });
});

describe("firebaseAuthErrorMessage sign-in enumeration safety", () => {
  it("collapses every bad-credential code to a single generic message", () => {
    const invalidCredential = firebaseAuthErrorMessage(
      "auth/invalid-credential",
      SIGN_IN_COPY.errors,
    );
    const userNotFound = firebaseAuthErrorMessage(
      "auth/user-not-found",
      SIGN_IN_COPY.errors,
    );
    const wrongPassword = firebaseAuthErrorMessage(
      "auth/wrong-password",
      SIGN_IN_COPY.errors,
    );
    expect(userNotFound).toBe(invalidCredential);
    expect(wrongPassword).toBe(invalidCredential);
  });
});
