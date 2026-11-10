#!/usr/bin/env bash
set -euo pipefail

FLOW_NAME="${1:?Pass a flow name, e.g. home-intro}"
ROOT=".cursor/artifacts/animations/$FLOW_NAME"
FPS="${ANIMATION_FPS:-60}"

for implementation in original migrated; do
  input="$ROOT/$implementation/run.webm"
  output="$ROOT/$implementation/frames"
  [[ -f "$input" ]] || {
    echo "Missing recording: $input" >&2
    exit 1
  }
  mkdir -p "$output"
  rm -f "$output"/frame-*.png
  ffmpeg -y -i "$input" \
    -vf "fps=$FPS" \
    "$output/frame-%04d.png"
done
