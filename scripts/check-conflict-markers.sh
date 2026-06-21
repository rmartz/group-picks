#!/usr/bin/env bash
# Block commits that introduce merge-conflict markers.
#
# Mirrors the detection in rmartz/dotfiles check_conflict_markers.py: a file is
# flagged only when it contains an unambiguous *angle* marker — a line starting
# with seven "<" or seven ">" (`<<<<<<< HEAD`, `>>>>>>> branch`). These never
# occur in normal source or Markdown, so a Markdown setext underline or a lone
# "=======" divider is never a false positive.
#
# Why this exists: the PostToolUse prettier hook is conflict-aware (it skips
# files mid-conflict), but nothing stops a marker from being staged and
# committed directly. This is the commit-time backstop.
#
# Mode:
#   check-conflict-markers.sh --staged    # scan staged blobs (pre-commit)
#
# Bypass: git commit --no-verify skips the pre-commit hook (git-native), or set
# ALLOW_CONFLICT_MARKERS=1 to let this check pass for an intentional marker-like
# line.

if [ "${1:-}" != "--staged" ]; then
  echo "Usage: check-conflict-markers.sh --staged" >&2
  exit 1
fi

if [ "${ALLOW_CONFLICT_MARKERS:-}" = "1" ]; then
  exit 0
fi

angle_re='^(<<<<<<<|>>>>>>>)([[:space:]]|$)'
failed=0

while IFS= read -r -d '' file; do
  # Read the staged blob (not the working tree) so partially-staged files are
  # judged on exactly what will be committed. Skip binary/unreadable blobs.
  if git show ":$file" 2>/dev/null | grep -Eq "$angle_re"; then
    if [ "${GITHUB_ACTIONS:-}" = "true" ]; then
      echo "::error file=$file,title=Conflict markers::$file contains merge-conflict markers"
    else
      echo "error: $file contains merge-conflict markers"
    fi
    failed=1
  fi
done < <(git diff --cached --name-only --diff-filter=ACMR -z)

if [ "$failed" -ne 0 ]; then
  echo ""
  echo "Resolve the merge-conflict markers above before committing."
  echo "Bypass: git commit --no-verify (or ALLOW_CONFLICT_MARKERS=1)"
  exit 1
fi
