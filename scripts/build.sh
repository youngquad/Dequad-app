#!/usr/bin/env bash
# DEQUAD — EAS Build Helper
#
# Usage:
#   ./scripts/build.sh dev          # development build (iOS + Android)
#   ./scripts/build.sh preview      # internal testing build (iOS + Android)
#   ./scripts/build.sh prod         # store-ready build (iOS + Android)
#   ./scripts/build.sh submit       # submit latest builds to TestFlight + Play
#   ./scripts/build.sh ota          # push OTA JS update to production channel
#   ./scripts/build.sh doctor       # diagnose project health
#
# See /app/EAS_BUILD_GUIDE.md for full setup instructions.

set -euo pipefail

# Always run from the frontend dir, regardless of where the script is invoked
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}/frontend"

CMD="${1:-help}"

require_eas() {
  if ! command -v eas >/dev/null 2>&1; then
    echo "✖ eas-cli not installed. Run: npm install -g eas-cli"
    exit 1
  fi
}

case "${CMD}" in
  dev)
    require_eas
    echo "→ Building DEVELOPMENT for iOS + Android..."
    eas build --profile development --platform all
    ;;
  preview)
    require_eas
    echo "→ Building PREVIEW (internal testing) for iOS + Android..."
    eas build --profile preview --platform all
    ;;
  prod|production)
    require_eas
    echo "→ Building PRODUCTION for iOS + Android..."
    eas build --profile production --platform all
    ;;
  ios)
    require_eas
    PROFILE="${2:-preview}"
    eas build --profile "${PROFILE}" --platform ios
    ;;
  android)
    require_eas
    PROFILE="${2:-preview}"
    eas build --profile "${PROFILE}" --platform android
    ;;
  submit)
    require_eas
    echo "→ Submitting latest iOS build to TestFlight..."
    eas submit --platform ios --latest
    echo "→ Submitting latest Android build to Play Console..."
    eas submit --platform android --latest
    ;;
  ota)
    require_eas
    MSG="${2:-Routine OTA update}"
    eas update --branch production --message "${MSG}"
    ;;
  doctor)
    npx expo-doctor
    ;;
  validate)
    node -e "JSON.parse(require('fs').readFileSync('app.json','utf8')); console.log('✓ app.json is valid JSON')"
    node -e "JSON.parse(require('fs').readFileSync('eas.json','utf8')); console.log('✓ eas.json is valid JSON')"
    ;;
  help|*)
    cat <<EOF
DEQUAD — EAS Build Helper

Commands:
  dev                  Build development client (iOS + Android)
  preview              Build preview / internal-testing (iOS + Android)
  prod                 Build production / store-ready (iOS + Android)
  ios [profile]        Build iOS only (default profile: preview)
  android [profile]    Build Android only (default profile: preview)
  submit               Submit latest builds to TestFlight + Play Console
  ota [message]        Push OTA JS update to production channel
  doctor               Run expo-doctor diagnostics
  validate             Validate app.json + eas.json syntax
  help                 Show this message

Examples:
  ./scripts/build.sh preview
  ./scripts/build.sh ios production
  ./scripts/build.sh ota "Fix chat reply bug"

Full setup guide: /app/EAS_BUILD_GUIDE.md
EOF
    ;;
esac
