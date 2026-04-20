import { cookies } from "next/headers";
import { getAdminAuth } from "@/lib/firebase/admin";

export async function getVerifiedUid(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) return undefined;
  try {
    const decoded = await getAdminAuth().verifySessionCookie(
      sessionCookie,
      true,
    );
    return decoded.uid;
  } catch {
    return undefined;
  }
}
