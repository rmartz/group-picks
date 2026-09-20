#!/usr/bin/env node
/**
 * Validates the docs/ reference tree against two conventions:
 *
 *   1. OKF frontmatter — every content page (docs/**\/*.md that is not an
 *      `index.md`) opens with a YAML frontmatter block carrying the OKF (Open
 *      Knowledge Format) core fields: a `type` in the repo's type vocabulary, a
 *      non-empty `title`, and a non-empty `description`. A `resource:` path,
 *      when present, must exist in the repo. The reserved `index.md` is exempt
 *      (OKF §8/§11): it carries no frontmatter, save an optional `okf_version`.
 *
 *   2. Index coverage & navigability — every directory that holds docs has an
 *      `index.md`; every non-index page is linked from its own directory's
 *      `index.md`; and every subdirectory's `index.md` is linked from its
 *      parent directory's `index.md`. So a reader can walk
 *      docs/index.md -> sub/index.md -> sub/page.md from the root and reach
 *      every page.
 *
 * Frontmatter is parsed directly (no dependency), the same constrained-YAML way
 * validate-config.mjs parses deployment/.
 *
 * Exits 0 when the whole tree is conformant, 1 when any violation is found.
 */

import { existsSync, readdirSync, readFileSync } from "fs";
import { dirname, join, posix, relative, sep } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const docsDir = join(root, "docs");

// Canonical OKF `type` vocabulary for this repo (documented in docs/index.md).
// Extend both lists together when a genuinely new kind of page is introduced.
// The reserved `index.md` is not typed (it carries no frontmatter, OKF §8), so
// there is no `Index` type — content pages are one of the values below.
const ALLOWED_TYPES = [
  "Architecture",
  "DataModel",
  "Domain",
  "Reference",
  "Workflow",
];
const INDEX = "index.md";
// The one frontmatter key the reserved `index.md` may carry (OKF §8): a
// bundle-root index MAY declare `okf_version`. Any other key is disallowed.
const INDEX_ALLOWED_KEYS = ["okf_version"];

/** All *.md files under docs/, as posix paths relative to docsDir, sorted. */
function collectMdFiles() {
  if (!existsSync(docsDir)) return [];
  return readdirSync(docsDir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => relative(docsDir, join(entry.parentPath, entry.name)))
    .map((relPath) => relPath.split(sep).join(posix.sep))
    .sort();
}

/** posix dirname relative to docsDir, with the root normalized to "". */
function parentDir(relPath) {
  const dir = posix.dirname(relPath);
  return dir === "." ? "" : dir;
}

/**
 * Key/value map from a leading --- ... --- frontmatter block, or undefined when
 * the file does not open with a closed fence. Only scalar values are needed
 * (type, title, description, resource); list values like tags are ignored.
 */
function parseFrontmatter(content) {
  const lines = content.split("\n");
  if (lines[0]?.trim() !== "---") return undefined;

  const result = {};
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") return result;
    const colon = lines[i].indexOf(":");
    if (colon === -1) continue;
    const key = lines[i].slice(0, colon).trim();
    const value = lines[i]
      .slice(colon + 1)
      .trim()
      .replace(/^["']|["']$/g, "");
    if (key) result[key] = value;
  }
  return undefined; // no closing fence — treat as malformed
}

/**
 * OKF frontmatter violations for a single page, given its posix path relative
 * to docs and its raw content. The reserved `index.md` (OKF §8/§11) is exempt
 * from the `type`/`title`/`description` requirement — it carries no frontmatter
 * beyond an optional `okf_version`, and any other key is a violation so the
 * exemption can't be used to smuggle a typed index back in.
 */
export function frontmatterViolations(pageRel, content) {
  const label = `docs/${pageRel}`;
  const fm = parseFrontmatter(content);

  if (posix.basename(pageRel) === INDEX) {
    const hasOpener = content.split("\n")[0]?.trim() === "---";
    if (!hasOpener) return [];
    if (fm === undefined) {
      return [
        `${label}: malformed frontmatter (opening --- has no closing fence)`,
      ];
    }
    if (Object.keys(fm).length === 0) {
      return [
        `${label}: index files carry no frontmatter (empty --- block is not allowed)`,
      ];
    }
    // Only the bundle-root index.md may carry okf_version (OKF §8); subdirectory
    // index files must carry no frontmatter at all.
    const isRoot = pageRel === INDEX;
    const allowedKeys = isRoot ? INDEX_ALLOWED_KEYS : [];
    const disallowed = Object.keys(fm)
      .filter((key) => !allowedKeys.includes(key))
      .sort();
    if (disallowed.length === 0) return [];
    const constraint = isRoot
      ? "beyond `okf_version`"
      : "(subdirectory index files carry no frontmatter at all)";
    return [
      `${label}: index files carry no frontmatter ${constraint}` +
        ` (disallowed: ${disallowed.join(", ")})`,
    ];
  }

  if (!fm) {
    return [`${label}: missing frontmatter (no leading --- ... --- block)`];
  }

  const out = [];
  if (!fm.type) {
    out.push(`${label}: missing \`type\` (required OKF frontmatter field)`);
  } else if (!ALLOWED_TYPES.includes(fm.type)) {
    out.push(
      `${label}: invalid \`type: ${fm.type}\` (allowed: ${ALLOWED_TYPES.join(", ")})`,
    );
  }
  if (!fm.title) out.push(`${label}: missing \`title\``);
  if (!fm.description) out.push(`${label}: missing \`description\``);
  if (fm.resource && !existsSync(join(root, fm.resource))) {
    out.push(
      `${label}: \`resource: ${fm.resource}\` does not exist in the repo`,
    );
  }
  return out;
}

/**
 * The set of link targets in a directory's index.md, each normalized to a
 * posix path relative to docsDir with no trailing slash (so a link to a
 * subdirectory `sub/` and to `sub/index.md` both become resolvable). External
 * links (http:, mailto:) and pure anchors are ignored.
 */
function indexLinkTargets(dirRel) {
  const content = readFileSync(join(docsDir, dirRel, INDEX), "utf8");
  const link = /\]\(([^)\s]+)(?:\s+[^)]*)?\)/g;
  const targets = new Set();
  let match;
  while ((match = link.exec(content)) !== null) {
    const raw = match[1].split("#")[0].split("?")[0].trim();
    if (!raw || /^[a-z][a-z0-9+.-]*:/i.test(raw)) continue;
    let resolved = posix.normalize(posix.join(dirRel, raw)).replace(/\/$/, "");
    if (resolved === ".") resolved = "";
    targets.add(resolved);
  }
  return targets;
}

/** The set of directories (posix, relative to docs, "" = root) that need an index. */
function requiredIndexDirs(pages) {
  const dirs = new Set();
  for (const page of pages) {
    for (let dir = parentDir(page); ; dir = parentDir(dir)) {
      dirs.add(dir);
      if (dir === "") break;
    }
  }
  return dirs;
}

/** Index coverage + navigability violations across the whole docs/ tree. */
function coverageViolations(pages) {
  if (pages.length === 0) return [];

  const violations = [];
  const pageSet = new Set(pages);
  const requiredDirs = requiredIndexDirs(pages);

  for (const dir of [...requiredDirs].sort()) {
    const indexRel = dir === "" ? INDEX : posix.join(dir, INDEX);
    if (!pageSet.has(indexRel)) {
      const dirLabel = dir === "" ? "docs/" : `docs/${dir}/`;
      violations.push(
        `${dirLabel}: missing ${INDEX} (every directory containing docs needs an index page)`,
      );
      continue; // cannot check links from a missing index
    }

    const label = `docs/${indexRel}`;
    const targets = indexLinkTargets(dir);

    // (a) Every non-index page in this directory must be linked from its index.
    for (const page of pages) {
      if (parentDir(page) === dir && posix.basename(page) !== INDEX) {
        if (!targets.has(page)) {
          violations.push(
            `${label}: does not link to \`${posix.basename(page)}\` (docs/${page})`,
          );
        }
      }
    }

    // (b) Every child subdirectory's index must be linked from this index, so
    // the whole tree stays reachable from docs/index.md.
    for (const child of requiredDirs) {
      if (child === "" || parentDir(child) !== dir) continue;
      const childIndex = posix.join(child, INDEX);
      if (!targets.has(child) && !targets.has(childIndex)) {
        violations.push(
          `${label}: does not link to subdirectory index \`${child}/${INDEX}\``,
        );
      }
    }
  }
  return violations;
}

function main() {
  const pages = collectMdFiles();
  const violations = [
    ...pages.flatMap((page) =>
      frontmatterViolations(page, readFileSync(join(docsDir, page), "utf8")),
    ),
    ...coverageViolations(pages),
  ].sort();

  if (violations.length > 0) {
    console.error("docs/ convention violations:\n");
    for (const violation of violations) console.error(`  ✗ ${violation}`);
    console.error(
      `\n${violations.length} violation(s). See docs/index.md for the OKF` +
        ` frontmatter spec and the index-navigability convention.`,
    );
    process.exit(1);
  }

  console.log(`docs/ — ${pages.length} page(s) OK`);
}

// Run as a CLI when invoked directly; stay importable (for tests) otherwise.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main();
}
