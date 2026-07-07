#!/usr/bin/env node
import { fileURLToPath } from "node:url";

// Vercel "Ignored Build Step" — wired up via the `ignoreCommand` field in
// vercel.json. Vercel runs this for every deploy and reads its exit code:
// exit 1 = proceed with the build, exit 0 = cancel it.
//
// Policy: PRODUCTION deploys proceed; every non-production (preview) build is
// cancelled. Native Git-integration previews are therefore disabled entirely —
// a preview is created instead, on demand, by the label-driven
// `.github/workflows/preview-deploy.yml`, which runs `vercel deploy` only when a
// PR carries the `ready for UAT` label (#351). That makes the label workflow the
// sole preview path, so a preview exists exactly when a human is ready to test
// it — not on every push.

const BUILD = 1; // exit code → Vercel proceeds with the build
const SKIP = 0; // exit code → Vercel cancels the build

export function shouldBuild(env) {
  return env?.VERCEL_ENV === "production";
}

function main() {
  if (shouldBuild(process.env)) {
    console.log("✅ Production deploy — building.");
    process.exit(BUILD);
  }
  console.log(
    "⏭️  Non-production build cancelled — previews are created on demand by the `ready for UAT` label workflow (preview-deploy.yml).",
  );
  process.exit(SKIP);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
