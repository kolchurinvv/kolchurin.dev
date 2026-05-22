#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

color_for_coverage() {
  local coverage="$1"

  awk -v c="$coverage" 'BEGIN {
    if (c >= 90) print "#4c1";
    else if (c >= 80) print "#97CA00";
    else if (c >= 70) print "#a4a61d";
    else if (c >= 60) print "#dfb317";
    else if (c >= 50) print "#fe7d37";
    else print "#e05d44";
  }'
}

render_frontend_badge() {
  local value="$1"
  local color="$2"

  cat > "$ROOT_DIR/docs/badges/frontend-coverage.svg" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="178" height="20" role="img" aria-label="frontend coverage: $value">
  <title>frontend coverage: $value</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7"/>
    <stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>
    <stop offset=".9" stop-color="#000" stop-opacity=".3"/>
    <stop offset="1" stop-color="#000" stop-opacity=".5"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="178" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="116" height="20" fill="#555"/>
    <rect x="116" width="62" height="20" fill="$color"/>
    <rect width="178" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="58" y="15" fill="#010101" fill-opacity=".3">frontend coverage</text>
    <text x="58" y="14">frontend coverage</text>
    <text x="147" y="15" fill="#010101" fill-opacity=".3">$value</text>
    <text x="147" y="14">$value</text>
  </g>
</svg>
EOF
}

render_backend_badge() {
  local value="$1"
  local color="$2"

  cat > "$ROOT_DIR/docs/badges/backend-coverage.svg" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" width="176" height="20" role="img" aria-label="backend coverage: $value">
  <title>backend coverage: $value</title>
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#fff" stop-opacity=".7"/>
    <stop offset=".1" stop-color="#aaa" stop-opacity=".1"/>
    <stop offset=".9" stop-color="#000" stop-opacity=".3"/>
    <stop offset="1" stop-color="#000" stop-opacity=".5"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="176" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="114" height="20" fill="#555"/>
    <rect x="114" width="62" height="20" fill="$color"/>
    <rect width="176" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">
    <text x="57" y="15" fill="#010101" fill-opacity=".3">backend coverage</text>
    <text x="57" y="14">backend coverage</text>
    <text x="145" y="15" fill="#010101" fill-opacity=".3">$value</text>
    <text x="145" y="14">$value</text>
  </g>
</svg>
EOF
}

echo "Running frontend coverage..."
(
  cd "$ROOT_DIR/frontend"
  bun run test:coverage
)

frontend_percent=$(awk -F: '
  /^LF:/ { lf += $2 }
  /^LH:/ { lh += $2 }
  END {
    if (lf == 0) {
      print "0.0"
    } else {
      printf "%.1f", (lh / lf) * 100
    }
  }
' "$ROOT_DIR/frontend/coverage/lcov.info")

frontend_value="${frontend_percent}%"
frontend_color=$(color_for_coverage "$frontend_percent")
render_frontend_badge "$frontend_value" "$frontend_color"

echo "Running backend coverage..."
(
  cd "$ROOT_DIR/backend"
  go test -covermode=atomic -coverprofile=coverage.out ./...
)

backend_percent=$(cd "$ROOT_DIR/backend" && go tool cover -func=coverage.out | awk '/^total:/{gsub("%", "", $3); print $3}')
backend_percent=${backend_percent:-0.0}
backend_value="${backend_percent}%"
backend_color=$(color_for_coverage "$backend_percent")
render_backend_badge "$backend_value" "$backend_color"

echo "Updated badges:"
echo "- docs/badges/frontend-coverage.svg (${frontend_value})"
echo "- docs/badges/backend-coverage.svg (${backend_value})"
