// Debug user profiles for preview/staging testing (#319). Each profile maps to
// a real Firebase Auth user (the `id` doubles as the Firebase uid) that the
// seed script (scripts/seed-debug-users.mjs) creates along with its DB data.
// Keep this list in sync with that script.

export interface DebugProfile {
  /** Firebase Auth uid; custom tokens are minted for this value. */
  id: string;
  /** Shown in the switcher UI. */
  label: string;
  description: string;
  email: string;
  displayName: string;
}

export const DEBUG_PROFILES: readonly DebugProfile[] = [
  {
    id: "debug-alice",
    label: "Alice — group owner",
    description: "Owns a seeded group with a category and picks.",
    email: "alice@debug.local",
    displayName: "Alice (debug)",
  },
  {
    id: "debug-bob",
    label: "Bob — group member",
    description: "A member of Alice's seeded group.",
    email: "bob@debug.local",
    displayName: "Bob (debug)",
  },
  {
    id: "debug-casey",
    label: "Casey — newcomer",
    description: "No groups yet; exercises the empty state.",
    email: "casey@debug.local",
    displayName: "Casey (debug)",
  },
];

export function findDebugProfile(id: string): DebugProfile | undefined {
  return DEBUG_PROFILES.find((profile) => profile.id === id);
}

/**
 * Whether the debug auth switcher is active. Requires an explicit opt-in flag
 * AND a hard non-production backstop: even if the flag is mistakenly set in
 * production, `VERCEL_ENV === "production"` keeps the bypass disabled. On the
 * client `VERCEL_ENV` is undefined, so the flag alone governs rendering there;
 * the server endpoint enforces the full gate.
 */
export function isDebugAuthEnabled(): boolean {
  return (
    process.env["NEXT_PUBLIC_DEBUG_AUTH"] === "true" &&
    process.env["VERCEL_ENV"] !== "production"
  );
}
