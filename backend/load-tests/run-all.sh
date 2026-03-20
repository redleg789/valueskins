#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080}"

if ! command -v k6 >/dev/null 2>&1; then
  echo "k6 is required. Install from https://k6.io/docs/get-started/installation/"
  exit 1
fi

echo "[load-tests] Running smoke-core"
k6 run -e BASE_URL="$BASE_URL" backend/load-tests/smoke-core.js

echo "[load-tests] Running auth-abuse"
k6 run -e BASE_URL="$BASE_URL" backend/load-tests/auth-abuse.js

echo "[load-tests] Running large-payload-defense"
k6 run -e BASE_URL="$BASE_URL" backend/load-tests/large-payload-defense.js

echo "[load-tests] Completed"

