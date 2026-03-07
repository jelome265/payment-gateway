#!/usr/bin/env bash
set -e

# Record the absolute path of the root worksapce
ROOT_DIR=$(pwd)

REPOS=(
    "."
    "platform-java"
    "edge-node"
    "connectors-go"
    "payments-core-rust"
    "crypto-engine-c"
    "shared-contracts"
    "test-harness"
)

echo "Starting bulk commit across all payment gateway monorepos..."

for REPO in "${REPOS[@]}"; do
    if [ -d "$ROOT_DIR/$REPO/.git" ]; then
        echo "=========================================="
        echo "Processing $REPO..."
        cd "$ROOT_DIR/$REPO"
        
        # Determine current absolute path to verify we changed properly
        echo "Current directory: $(pwd)"
        
        git add .
        git commit -m "chore: automated baselining of monorepo implementation" || echo "No changes to commit in $REPO"
        
        # Return to root
        cd "$ROOT_DIR"
    else
        echo "Skipping $REPO - no .git directory found."
    fi
done

echo "=========================================="
echo "All monorepos have been processed and committed."
