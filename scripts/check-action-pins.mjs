#!/usr/bin/env node

// Enforce the action-pinning rule (AGENTS.md → Continuous Integration): every
// third-party GitHub Action must be pinned to a full 40-char commit SHA, not a
// mutable tag like `@v6`. A tag can be repointed at attacker code (supply-chain
// attack); a SHA is immutable. The pin must also carry a trailing `# vX.Y.Z`
// version comment — Dependabot reads the version from that comment to keep the
// SHA current, so a bare SHA with no comment would freeze the action forever.
// A ratchet to keep workflows pinned-and-updatable after the cleanup (#385).

import { readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SHA = /^[0-9a-f]{40}$/;
const USES = /^\s*-?\s*uses:\s*["']?([^"'\s#]+)/;
// A version comment Dependabot can track: `# v7.0.0`, `# v6`, `# 4.2.2`, … —
// a `#` followed by an optional `v` and a dotted version number.
const VERSION_COMMENT = /#\s*v?\d+(\.\d+)*/;

// A `uses:` value is exempt from SHA-pinning when it is a local action
// (`./…` / `../…`), a Docker image ref (`docker://…`), or has no `@ref` at all
// (e.g. a local composite action). Everything else is `owner/repo[/path]@ref`
// and must pin `ref` to a commit SHA with a version comment.
function isExempt(value) {
  return (
    value.startsWith("./") ||
    value.startsWith("../") ||
    value.startsWith("docker://") ||
    !value.includes("@")
  );
}

export function findUnpinnedActions(content) {
  const offenders = [];
  content.split("\n").forEach((text, index) => {
    const match = USES.exec(text);
    if (!match) return;
    const value = match[1];
    if (isExempt(value)) return;
    const ref = value.slice(value.lastIndexOf("@") + 1);
    const line = index + 1;
    if (!SHA.test(ref)) {
      offenders.push({
        line,
        uses: value,
        reason: "not pinned to a commit SHA",
      });
    } else if (!VERSION_COMMENT.test(text)) {
      offenders.push({
        line,
        uses: value,
        reason:
          "SHA pin needs a trailing version comment (e.g. `# v7.0.0`) for Dependabot",
      });
    }
  });
  return offenders;
}

function workflowFiles(dir) {
  return readdirSync(dir, { recursive: true })
    .filter((name) => extname(name) === ".yml" || extname(name) === ".yaml")
    .map((name) => join(dir, name));
}

function main() {
  const root = process.argv[2] ?? ".github";
  const failures = [];
  for (const file of workflowFiles(root)) {
    for (const offender of findUnpinnedActions(readFileSync(file, "utf8"))) {
      failures.push({ file, ...offender });
    }
  }
  if (failures.length === 0) {
    console.log(
      `${root}: all third-party actions are pinned to a commit SHA with a version comment.`,
    );
    return;
  }
  console.error(
    `${root}: pin third-party actions to a 40-char commit SHA with a version comment (e.g. "actions/checkout@9c091bb… # v7.0.0", not "@v7"):`,
  );
  for (const { file, line, uses, reason } of failures) {
    console.error(`  ${file}:${line}: ${uses} — ${reason}`);
  }
  process.exit(1);
}

// Run as a CLI when invoked directly; stay importable (for tests) otherwise.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
