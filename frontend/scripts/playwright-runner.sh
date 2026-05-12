#!/usr/bin/env bash
set -euo pipefail

is_ci="${CI:-}"
is_github_actions="${GITHUB_ACTIONS:-}"

if [ -n "${PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH:-}" ] && [ -x "${PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}" ]; then
  # Nix mode: force system Chromium and ignore Nix Playwright driver/browser env.
  unset PLAYWRIGHT_BROWSERS_PATH
  unset PLAYWRIGHT_DRIVER_PATH
  unset PLAYWRIGHT_NODEJS_PATH

  export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS="true"
  export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD="1"

  exec bunx playwright "$@"
fi

if [ "$is_ci" = "true" ] || [ "$is_github_actions" = "true" ]; then
  # CI mode (e.g. GitHub Actions): use Playwright-managed Chromium.
  unset PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
  unset PLAYWRIGHT_DRIVER_PATH
  unset PLAYWRIGHT_NODEJS_PATH
  unset PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD

  # Keep browser artifacts local to project dependencies in CI.
  export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-0}"

  bunx playwright install chromium
  exec bunx playwright "$@"
fi

echo "No Playwright browser runtime configured." >&2
echo "Either:" >&2
echo "  1) run from 'nix develop' (sets PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH), or" >&2
echo "  2) run in CI with CI=true/GITHUB_ACTIONS=true (auto-installs Chromium)." >&2
exit 1
