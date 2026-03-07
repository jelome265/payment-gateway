#!/bin/bash

# Bazel-driven commit script for multi-repo layout.
# This script is called via 'bazelisk run //:commit -- -m "message"'

set -euo pipefail

if [ -z "${1:-}" ] || [ "$1" != "-m" ] || [ -z "${2:-}" ]; then
    echo "Usage: bazelisk run //:commit -- -m \"commit message\""
    exit 1
fi

MESSAGE="$2"

# ============================================================
# SECRET FILE GUARD — abort if any secret file is staged
# ============================================================
FORBIDDEN_PATTERNS="*.env *.pem *.key *.p12 *.jks *.pfx"
OFFENDING_FILES=""

for pattern in $FORBIDDEN_PATTERNS; do
    MATCHES=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null | grep -E "\.$( echo "$pattern" | sed 's/\*\.//' )$" || true)
    if [ -n "$MATCHES" ]; then
        OFFENDING_FILES="$OFFENDING_FILES$MATCHES"$'\n'
    fi
done

# Also check about-to-be-staged files (since we git add . below)
for pattern in $FORBIDDEN_PATTERNS; do
    MATCHES=$(git status --porcelain 2>/dev/null | awk '{print $2}' | grep -E "\.$( echo "$pattern" | sed 's/\*\.//' )$" || true)
    if [ -n "$MATCHES" ]; then
        OFFENDING_FILES="$OFFENDING_FILES$MATCHES"$'\n'
    fi
done

if [ -n "$OFFENDING_FILES" ]; then
    echo "[BAZEL-COMMIT] ABORT: Secret files detected in working tree!"
    echo "[BAZEL-COMMIT] The following files must NOT be committed:"
    echo "$OFFENDING_FILES"
    echo "[BAZEL-COMMIT] Add them to .gitignore or remove them."
    exit 1
fi

echo "[BAZEL-COMMIT] Staging all changes in $(pwd)..."
git add .

echo "[BAZEL-COMMIT] Committing with message: $MESSAGE"
git commit -m "$MESSAGE"

if [ $? -eq 0 ]; then
    echo "[BAZEL-COMMIT] Success."
else
    echo "[BAZEL-COMMIT] Commit failed (possibly no changes to commit)."
fi
