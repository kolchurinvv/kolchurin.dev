#!/usr/bin/env bash
set -euo pipefail

# Prevent version mismatches between npm playwright and Nix-provided driver/browser paths.
unset PLAYWRIGHT_BROWSERS_PATH
unset PLAYWRIGHT_DRIVER_PATH
unset PLAYWRIGHT_NODEJS_PATH

export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS="true"
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="1"

if [ -z "${PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH:-}" ]; then
  echo "PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH is not set." >&2
  echo "Run tests from 'nix develop' so flake.nix can provide Chromium." >&2
  exit 1
fi

if [ ! -x "${PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}" ]; then
  echo "Configured Chromium executable is not executable:" >&2
  echo "  ${PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}" >&2
  exit 1
fi

exec bunx playwright "$@"
