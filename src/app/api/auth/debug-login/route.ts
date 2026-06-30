import { NextResponse } from "next/server";

import { findDebugProfile, isDebugAuthEnabled } from "@/lib/debug/profiles";
import { getAdminAuth } from "@/lib/firebase/admin";

// Preview/staging-only: mints a Firebase custom token for a seeded debug
// profile so testers can switch users without OAuth (#319). Hard-gated to
// non-production by isDebugAuthEnabled() — returns 404 anywhere it is not
// active, so the route is inert even if it ships in the production bundle.
export async function POST(request: Request) {
  if (!isDebugAuthEnabled()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { profileId: unknown };
  try {
    body = (await request.json()) as { profileId: unknown };
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.profileId !== "string") {
    return NextResponse.json(
      { error: "profileId is required" },
      { status: 400 },
    );
  }

  const profile = findDebugProfile(body.profileId);
  if (!profile) {
    return NextResponse.json({ error: "Unknown profile" }, { status: 400 });
  }

  const customToken = await getAdminAuth().createCustomToken(profile.id);
  return NextResponse.json({ customToken });
}
