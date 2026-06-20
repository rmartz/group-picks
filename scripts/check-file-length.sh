#!/usr/bin/env bash
# Enforce TypeScript file line-count limits.
#
# Called by both the pre-commit hook and CI so the rule cannot drift between
# commit time and the PR check.
#
# Modes:
#   check-file-length.sh --staged        # staged files vs HEAD (pre-commit)
#   check-file-length.sh --base <ref>    # changed files vs <ref> (CI)
#
# Thresholds from CLAUDE.md — 2× the recommended limit:
#   Source files: recommended ~200 lines, split at ~240, hard cap 400
#   Test files:   recommended ~300 lines, split at ~360, hard cap 600
#
# Bypass: git commit --no-verify skips the pre-commit hook (git-native).

SOURCE_LIMIT=400
TEST_LIMIT=600

mode="$1"
failed=0

case "$mode" in
  --staged)
    files=$(git diff --cached --name-only --diff-filter=ACM)
    ;;
  --base)
    base="$2"
    if [ -z "$base" ]; then
      echo "Usage: check-file-length.sh --base <ref>" >&2
      exit 1
    fi
    files=$(git diff --name-only "$base" HEAD)
    ;;
  *)
    echo "Usage: check-file-length.sh --staged | --base <ref>" >&2
    exit 1
    ;;
esac

while IFS= read -r file; do
  [ -n "$file" ] || continue

  # Skip deleted files
  [ -f "$file" ] || continue

  # Only check TypeScript files
  case "$file" in
    *.ts|*.tsx) ;;
    *) continue ;;
  esac

  # Determine limit by file type
  case "$file" in
    *.spec.ts|*.spec.tsx|*.test.ts|*.test.tsx|*-tests/*.ts|*-tests/*.tsx)
      limit=$TEST_LIMIT
      kind="test"
      ;;
    *)
      limit=$SOURCE_LIMIT
      kind="source"
      ;;
  esac

  # In staged mode, count lines from the index (not the working tree) so
  # partially-staged files are judged on what will actually be committed.
  if [ "$mode" = "--staged" ]; then
    lines=$(git show ":$file" 2>/dev/null | wc -l | tr -d ' ')
  else
    lines=$(wc -l < "$file" | tr -d ' ')
  fi

  if [ "$lines" -ge "$limit" ]; then
    if [ "${GITHUB_ACTIONS:-}" = "true" ]; then
      echo "::error file=$file,title=File too long::$file — $lines lines ($kind limit: $limit)"
    else
      echo "error: $file — $lines lines ($kind limit: $limit)"
    fi
    failed=1
  fi
done <<< "$files"

if [ "$failed" -ne 0 ]; then
  echo ""
  echo "One or more files exceed the maximum allowed line count."
  echo "  Source files: recommended ~200 lines, split at ~240, hard cap at ${SOURCE_LIMIT}+"
  echo "  Test files:   recommended ~300 lines, split at ~360, hard cap at ${TEST_LIMIT}+"
  echo "Split large files by logical concern before merging."
  echo "Bypass: git commit --no-verify"
  exit 1
fi
