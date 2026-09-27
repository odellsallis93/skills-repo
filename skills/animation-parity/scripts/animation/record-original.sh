#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

FLOW_NAME="${1:?Pass a flow name, e.g. home-intro}"
URL="${2:-${ORIGINAL_URL:-http://localhost:4000}}"
SESSION="animation-original"
ROOT=".cursor/artifacts/animations/$FLOW_NAME/original"
PROJECT_FLOW=".cursor/animation/flows/$FLOW_NAME.sh"
SKILL_FLOW="$SKILL_ROOT/scripts/animation/flows/$FLOW_NAME.sh"

if [[ -x "$PROJECT_FLOW" ]]; then
  FLOW_SCRIPT="$PROJECT_FLOW"
elif [[ -x "$SKILL_FLOW" ]]; then
  FLOW_SCRIPT="$SKILL_FLOW"
else
  FLOW_SCRIPT=""
fi

mkdir -p "$ROOT"
cat > "$ROOT/capture-metadata.txt" <<EOF
implementation=original
flow=$FLOW_NAME
url=$URL
viewport=${ANIMATION_VIEWPORT_WIDTH:-1440}x${ANIMATION_VIEWPORT_HEIGHT:-900}
dpr=${ANIMATION_DPR:-2}
ready_wait_ms=${ANIMATION_READY_WAIT_MS:-500}
clarity_wait_ms=${ANIMATION_CLARITY_WAIT_MS:-1500}
flow_script=${FLOW_SCRIPT:-none}
captured_at=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

agent-browser --session "$SESSION" set viewport \
  "${ANIMATION_VIEWPORT_WIDTH:-1440}" \
  "${ANIMATION_VIEWPORT_HEIGHT:-900}" \
  "${ANIMATION_DPR:-2}"
agent-browser --session "$SESSION" open "$URL"
agent-browser --session "$SESSION" wait --load networkidle
agent-browser --session "$SESSION" wait --fn \
  "document.fonts && document.fonts.status === 'loaded'"
agent-browser --session "$SESSION" wait "${ANIMATION_READY_WAIT_MS:-500}"
agent-browser --session "$SESSION" snapshot -i > "$ROOT/before.snapshot.txt"
agent-browser --session "$SESSION" screenshot --annotate "$ROOT/before.annotated.png"
agent-browser --session "$SESSION" record start "$ROOT/run.webm"

if [[ -n "$FLOW_SCRIPT" ]]; then
  bash "$FLOW_SCRIPT" "$SESSION"
else
  agent-browser --session "$SESSION" wait "${ANIMATION_CLARITY_WAIT_MS:-1500}"
fi

agent-browser --session "$SESSION" record stop
agent-browser --session "$SESSION" screenshot "$ROOT/after.png"
agent-browser --session "$SESSION" snapshot -i > "$ROOT/after.snapshot.txt"
