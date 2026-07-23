/**
 * Firebase auth error-code reconciliation.
 *
 * Auth surfaces catch errors and look up a user-facing message keyed on the
 * Firebase Web-SDK code (`auth/*`). The SDK normally normalizes the underlying
 * Identity Toolkit / REST codes (e.g. `EMAIL_EXISTS`) to those `auth/*` codes,
 * but a raw code occasionally reaches the client and would otherwise match no
 * key and fall through to the generic default. This module normalizes any code
 * to its `auth/*` form before lookup, so both forms resolve to the same
 * message. The user-facing strings themselves live in each surface's
 * co-located `copy.ts` per the i18n-readiness convention.
 */

/**
 * Raw Identity Toolkit / REST error codes mapped to their Firebase Web-SDK
 * (`auth/*`) equivalents. Kept in alphabetical order to minimize merge
 * conflicts.
 */
const RAW_TO_SDK_AUTH_CODE: Readonly<Record<string, string>> = {
  EMAIL_EXISTS: "auth/email-already-in-use",
  EMAIL_NOT_FOUND: "auth/user-not-found",
  INVALID_EMAIL: "auth/invalid-email",
  INVALID_LOGIN_CREDENTIALS: "auth/invalid-credential",
  INVALID_PASSWORD: "auth/wrong-password",
  MISSING_EMAIL: "auth/missing-email",
  OPERATION_NOT_ALLOWED: "auth/operation-not-allowed",
  TOO_MANY_ATTEMPTS_TRY_LATER: "auth/too-many-requests",
  USER_DISABLED: "auth/user-disabled",
  WEAK_PASSWORD: "auth/weak-password",
};

/**
 * Normalizes a Firebase auth error code to its `auth/*` SDK form. Codes that
 * are already in `auth/*` form (or are otherwise unrecognized) are returned
 * unchanged.
 */
export function normalizeFirebaseAuthCode(code: string): string {
  return RAW_TO_SDK_AUTH_CODE[code] ?? code;
}

interface AuthErrorMessages {
  readonly default: string;
  readonly [code: string]: string | undefined;
}

/**
 * Resolves the user-facing message for a Firebase auth error code against a
 * surface's message map, reconciling raw and SDK code forms and falling back to
 * the surface's `default` for unknown codes.
 */
export function firebaseAuthErrorMessage(
  code: string,
  messages: AuthErrorMessages,
): string {
  return messages[normalizeFirebaseAuthCode(code)] ?? messages.default;
}
