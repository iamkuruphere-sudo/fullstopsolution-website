#!/usr/bin/env bash
# Fullstop Solution Release Sync Script
# Runs Python release sync engine
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

echo "=== Fullstop Solution: Syncing Latest Releases from GitHub ==="
python3 "${SCRIPT_DIR}/sync-releases.py" "$@"
