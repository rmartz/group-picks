#!/usr/bin/env node

// Enforce the full-semver pin rule (AGENTS.md → Package Manager): every registry
// dependency in package.json must specify a full major.minor.patch base, even
// inside a ^/~ range, so a Dependabot bump always shows as a reviewable
// package.json change rather than a lockfile-only update (#344). A ratchet to
// keep the manifest compliant after the one-time cleanup.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Specifiers that are not a registry semver range — skip them.
const NON_REGISTRY =
  /^(workspace:|catalog:|link:|file:|git\+|github:|https?:|npm:)/;
const FULL_SEMVER = /^\d+\.\d+\.\d+([-+].+)?$/;

const SECTIONS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
];

export function findUnpinnedDependencies(manifest) {
  const offenders = [];
  for (const section of SECTIONS) {
    for (const [name, range] of Object.entries(manifest[section] ?? {})) {
      if (NON_REGISTRY.test(range) || range === "*" || range === "latest") {
        continue;
      }
      if (!FULL_SEMVER.test(range.replace(/^[\^~]/, ""))) {
        offenders.push({ section, name, range });
      }
    }
  }
  return offenders;
}

function main() {
  const path = process.argv[2] ?? "package.json";
  const offenders = findUnpinnedDependencies(
    JSON.parse(readFileSync(path, "utf8")),
  );
  if (offenders.length === 0) {
    console.log(
      `${path}: all dependency pins specify a full major.minor.patch.`,
    );
    return;
  }
  console.error(
    `${path}: these pins must specify a full major.minor.patch base (e.g. "^3.8.4", not "^3"):`,
  );
  for (const { section, name, range } of offenders) {
    console.error(`  ${section} / ${name}: "${range}"`);
  }
  process.exit(1);
}

// Run as a CLI when invoked directly; stay importable (for tests) otherwise.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
