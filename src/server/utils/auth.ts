import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";

const SESSION_COOKIE_NAME = "session";

const AUTH_ERROR_CODES = new Set([
  "auth/session-cookie-expired",
  "auth/session-cookie-revoked",
  "auth/invalid-session-cookie",
  "auth/argument-error",
]);

export async function getVerifiedUid(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return undefined;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    );
    return decoded.uid;
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code && AUTH_ERROR_CODES.has(code)) return undefined;
    throw err;
  }
}
