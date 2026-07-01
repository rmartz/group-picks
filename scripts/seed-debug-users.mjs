#!/usr/bin/env node

// Seed the Firebase Auth users and Realtime Database data that back the
// preview-only debug user switcher (#319). The switcher mints custom tokens for
// these uids; this script makes the matching Auth users and a small slice of
// group/category/pick data exist so the app's membership checks pass once a
// debug user signs in.
//
// Run against a preview/staging project only — never production:
//   pnpm run seed:debug
//
// Idempotent: re-running updates existing Auth users and overwrites the seeded
// nodes at their fixed IDs rather than creating duplicates.
//
// IMPORTANT: keep DEBUG_PROFILES in sync with src/lib/debug/profiles.ts (this
// is a .mjs script and cannot import the .ts module).

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";

const DEBUG_PROFILES = [
  {
    id: "debug-alice",
    email: "alice@debug.local",
    displayName: "Alice (debug)",
  },
  {
    id: "debug-bob",
    email: "bob@debug.local",
    displayName: "Bob (debug)",
  },
  {
    id: "debug-casey",
    email: "casey@debug.local",
    displayName: "Casey (debug)",
  },
];

// Fixed IDs so re-seeding overwrites in place instead of accumulating data.
const GROUP_ID = "debug-group";
const CATEGORY_ID = "debug-category";
const PICK_ID = "debug-pick";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. Run \`pnpm run env:pull\` to populate .env.local first.`,
    );
  }
  return value;
}

function initAdminApp() {
  if (process.env["VERCEL_ENV"] === "production") {
    throw new Error(
      "Refusing to seed debug users against a production environment (VERCEL_ENV=production).",
    );
  }

  const existing = getApps().find((a) => a.name === "[DEFAULT]");
  if (existing) return existing;

  return initializeApp({
    credential: cert({
      projectId: requireEnv("FIREBASE_PROJECT_ID"),
      clientEmail: requireEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: requireEnv("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    }),
    databaseURL: requireEnv("FIREBASE_DATABASE_URL"),
  });
}

async function upsertAuthUser(auth, profile) {
  const properties = {
    uid: profile.id,
    email: profile.email,
    displayName: profile.displayName,
    emailVerified: true,
  };
  try {
    await auth.createUser(properties);
    console.log(`Created Auth user ${profile.id}`);
  } catch (error) {
    if (
      error.code === "auth/uid-already-exists" ||
      error.code === "auth/email-already-exists"
    ) {
      await auth.updateUser(profile.id, {
        email: profile.email,
        displayName: profile.displayName,
        emailVerified: true,
      });
      console.log(`Updated existing Auth user ${profile.id}`);
      return;
    }
    throw error;
  }
}

async function seedDatabase(db) {
  const now = Date.now();
  const [alice, bob] = DEBUG_PROFILES;

  await db.ref().update({
    [`groups/${GROUP_ID}`]: {
      public: {
        name: "Debug Movie Night",
        createdAt: now,
        creatorId: alice.id,
        inviteToken: "debugInviteToken",
        adminIds: { [alice.id]: true },
        picksRestricted: false,
      },
      members: { [alice.id]: true, [bob.id]: true },
    },
    [`users/${alice.id}/groups/${GROUP_ID}`]: true,
    [`users/${bob.id}/groups/${GROUP_ID}`]: true,
    [`categories/${CATEGORY_ID}`]: {
      public: {
        name: "Movies",
        description: "Pick what we watch this weekend.",
        groupId: GROUP_ID,
        createdAt: now,
        creatorId: alice.id,
      },
      picks: {
        [PICK_ID]: {
          title: "Saturday movie",
          description: "Rank your favourites.",
          topCount: 1,
          categoryId: CATEGORY_ID,
          createdAt: now,
          creatorId: alice.id,
          options: {
            "option-dune": { ownerIds: [alice.id], title: "Dune" },
            "option-arrival": { ownerIds: [bob.id], title: "Arrival" },
          },
        },
      },
    },
  });

  console.log(
    `Seeded group ${GROUP_ID} (members: ${alice.id}, ${bob.id}), category ${CATEGORY_ID}, pick ${PICK_ID}`,
  );
}

async function main() {
  const app = initAdminApp();
  const auth = getAuth(app);
  const db = getDatabase(app);

  for (const profile of DEBUG_PROFILES) {
    await upsertAuthUser(auth, profile);
  }

  await seedDatabase(db);

  console.log("Debug seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
