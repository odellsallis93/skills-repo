# Animation Parity Reference

## Global skill, per-repo working folders

This skill is installed globally at `~/.cursor/skills/animation-parity/`.

Each repository keeps its own working folders inside `.cursor`:

- `.cursor/docs/` — the behavior spec
- `.cursor/artifacts/` — per-flow evidence bundles
- `.cursor/animation/flows/` — optional project-specific recorder actions

The recording, extraction, and diff scripts live in this skill's `scripts/`
directory. Create the docs and artifacts folders if they are missing before
recording, and keep the `anim:*` commands in `package.json` pointed at the
global skill scripts.

Example `package.json` entries:

```json
{
  "scripts": {
    "anim:record:original": "bash \"$HOME/.cursor/skills/animation-parity/scripts/animation/record-original.sh\"",
    "anim:record:migrated": "bash \"$HOME/.cursor/skills/animation-parity/scripts/animation/record-migrated.sh\"",
    "anim:extract": "bash \"$HOME/.cursor/skills/animation-parity/scripts/animation/extract-frames.sh\"",
    "anim:diff": "node \"$HOME/.cursor/skills/animation-parity/scripts/diff-frames.mjs\"",
    "anim:review": "bash \"$HOME/.cursor/skills/animation-parity/scripts/animation/review-flow.sh\""
  }
}
```

## Behavior specification first

The canonical behavior contract is `.cursor/docs/animation-behavior-spec.md`.

Before a parity run, search for it. If missing, create it from
[behavior-spec-template.md](behavior-spec-template.md) after inspecting the
source implementation and observing the affected flows. A copied template is
not a valid specification. Complete every field relevant to the flow, remove
template markers, and resolve blocking questions before recording.

Treat the original implementation as evidence rather than unquestioned product
intent. Call out differences between legacy behavior and confirmed requirements.
Update only the affected flow when behavior changes; preserve accepted evidence
and historical decisions.

## Artifact layout

Each flow is stored independently:

```text
.cursor/artifacts/animations/<flow>/
  original/
    before.annotated.png
    before.snapshot.txt
    capture-metadata.txt
    run.webm
    after.png
    after.snapshot.txt
    frames/
  migrated/
    before.annotated.png
    before.snapshot.txt
    capture-metadata.txt
    run.webm
    after.png
    after.snapshot.txt
    frames/
  diffs/timeline/
    frame-0001.png
    summary.json
  behavior-spec.md
```

`anim:review` copies the exact behavior spec used for the run to
`behavior-spec.md`, making an artifact self-contained. Ignore
`.cursor/artifacts/animations/*` in Git. Keep representative evidence locally or
attach it to the task/PR when the result matters.

## Prerequisites

Install and verify:

- a running original and migrated site
- `agent-browser` (or a compatible CLI with the same commands)
- `ffmpeg`
- Node dependencies: `pixelmatch` and `pngjs`

The scripts use these environment variables:

```bash
export ORIGINAL_URL=http://localhost:4000
export MIGRATED_URL=http://localhost:3000
export ANIMATION_VIEWPORT_WIDTH=1440
export ANIMATION_VIEWPORT_HEIGHT=900
export ANIMATION_DPR=2
```

## Recording a flow

Run the original first:

```bash
npm run anim:record:original -- home-intro
```

Then run the migrated implementation:

```bash
npm run anim:record:migrated -- home-intro
```

The default recorder captures page load and a clarity pause. For a real
interaction, add an executable flow script. Scripts resolve in this order:

1. `.cursor/animation/flows/<flow>.sh` in the current repository
2. `~/.cursor/skills/animation-parity/scripts/animation/flows/<flow>.sh`

The flow script receives the browser session name as its first argument and
should perform the exact same actions in both runs:

```bash
#!/usr/bin/env bash
set -euo pipefail
SESSION="${1:?Missing browser session}"

agent-browser --session "$SESSION" click @e3
agent-browser --session "$SESSION" wait 1500
```

Use three waits deliberately:

1. `wait --load networkidle` for a stable starting line.
2. `wait --fn "..."` for an app readiness or animation phase signal.
3. `wait 500` or `wait 1500` as a recording clarity window.

Useful app signals include `window.__pageReady`, `window.__introFinished`,
`data-phase`, and `data-animation-id`.

## Extracting and diffing

Extract 100ms frames (10fps):

```bash
npm run anim:extract -- home-intro
```

Diff matching frames:

```bash
npm run anim:diff -- \
  .cursor/artifacts/animations/home-intro/original/frames \
  .cursor/artifacts/animations/home-intro/migrated/frames \
  .cursor/artifacts/animations/home-intro/diffs/timeline
```

Run the complete sequence:

```bash
npm run anim:review -- home-intro
```

The wrapper fails before recording when `.cursor/docs/animation-behavior-spec.md` is
missing, incomplete, or missing a matching `### <flow-name>` section, so the
behavior contract cannot be skipped. Use lowercase kebab-case flow names. The
wrapper creates the flow artifact directory and persists the spec, recordings,
snapshots, frames, diff images, metadata, and summary as it runs.

The diff script writes `summary.json` with per-frame mismatch percentages,
mean mismatch, peak mismatch, and frames above the default 3% threshold.
Different frame counts are reported as a failure because the timelines are not
aligned.

## Structural and visual review

Use temporal diffs for motion and ordering, spatial screenshots for exact
appearance, and structural snapshots for semantic state. Verify modal presence,
hidden/inert background content, disabled controls, and text swaps at the
correct phase.

For nondeterministic WebGL, seed randomness or crop/mask the animated region
before diffing. Do not fail a UI migration solely because decorative particles
drift. Do not mask UI choreography or brand-critical motion.

## Minimum flow matrix

When applicable, review:

- cold page-load intro
- forward and backward navigation
- menu open and close
- modal open and close
- return home after navigation
- deep-link reload
- interrupted interactions
- mobile-specific motion and camera behavior

## Troubleshooting

- `agent-browser: command not found`: install it or adapt the recorder scripts
  to the browser automation CLI used by the project.
- `ffmpeg: command not found`: install FFmpeg and ensure it is on `PATH`.
- missing or mismatched frames: confirm both videos were recorded at the same
  viewport and that the clarity pause is long enough.
- noisy WebGL diffs: seed time/randomness or restrict comparison to the DOM/UI
  region.
- timing drift: add explicit readiness and phase signals rather than increasing
  arbitrary sleeps.
- one-frame flash: inspect adjacent frames and structural snapshots; a final
  screenshot cannot prove this bug is absent.
