#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

FLOW_NAME="${1:?Pass a flow name, e.g. home-intro}"
SPEC_PATH=".cursor/docs/animation-behavior-spec.md"
ARTIFACT_ROOT=".cursor/artifacts/animations/$FLOW_NAME"

if [[ ! "$FLOW_NAME" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "Flow name must be lowercase kebab-case: $FLOW_NAME" >&2
  exit 1
fi

if [[ ! -f "$SPEC_PATH" ]]; then
  cat >&2 <<EOF
Missing required behavior specification: $SPEC_PATH

Create a complete observed specification before recording. Start from:
$SKILL_ROOT/behavior-spec-template.md
EOF
  exit 1
fi

if rg --quiet --glob '*.md' '(TODO|<flow-name>|<[^>]+>)' "$SPEC_PATH"; then
  echo "Behavior specification contains incomplete template markers: $SPEC_PATH" >&2
  exit 1
fi

if ! rg --quiet "^### \`?${FLOW_NAME}\`?( |$)" "$SPEC_PATH"; then
  echo "Behavior specification does not define flow: $FLOW_NAME" >&2
  exit 1
fi

mkdir -p "$ARTIFACT_ROOT"
cp "$SPEC_PATH" "$ARTIFACT_ROOT/behavior-spec.md"

bash "$SCRIPT_DIR/record-original.sh" "$FLOW_NAME"
bash "$SCRIPT_DIR/record-migrated.sh" "$FLOW_NAME"
bash "$SCRIPT_DIR/extract-frames.sh" "$FLOW_NAME"
node "$SKILL_ROOT/scripts/diff-frames.mjs" \
  "$ARTIFACT_ROOT/original/frames" \
  "$ARTIFACT_ROOT/migrated/frames" \
  "$ARTIFACT_ROOT/diffs/timeline"
