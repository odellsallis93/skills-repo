# Visual verification reference

Read the sections relevant to the change. Use agent-browser and FFmpeg with the
project's existing preview and artifact conventions. If agent-browser is
unavailable, disclose the fallback and use Playwright. Ask before substituting
other browser or FFmpeg tools.

## agent-browser and FFmpeg

Read `agent-browser skills get core` and check the installed command help before
running browser commands. Use a named session for the task. Set the session on
every invocation or export `AGENT_BROWSER_SESSION` in the shell running them;
do not assume separate shell calls retain exported variables.

For a static browser change, open the running preview, set the required viewport,
wait for the relevant content and assets, then capture an unannotated screenshot
for appearance review. Keep annotated images separate from comparison images.
For example, after setting `VISUAL_URL` and an absolute, run-specific
`VISUAL_ARTIFACT_DIR`:

```bash
export AGENT_BROWSER_SESSION="$(agent-browser session id --scope worktree --prefix visual)"
mkdir -p "$VISUAL_ARTIFACT_DIR"
agent-browser open "$VISUAL_URL"
agent-browser set viewport 1440 900 1
agent-browser snapshot -i
# Wait for the actual content, fonts, and assets required by the affected state.
agent-browser screenshot "$VISUAL_ARTIFACT_DIR/after.png"
```

Open the resulting PNG with an image-viewing tool. A screenshot path or
accessibility snapshot alone is not visual inspection. Refresh snapshot refs
after navigation or state changes; choose actions from the current page.

For an interactive motion flow, start recording before the trigger, perform the
observed actions, wait for the expected final state, and stop recording:

```bash
agent-browser record start "$VISUAL_ARTIFACT_DIR/run.webm" --fps 60
# Perform the affected interaction using current refs or semantic locators.
# Wait for the flow's observed completion signal and settled result.
agent-browser record stop
agent-browser screenshot "$VISUAL_ARTIFACT_DIR/after.png"
```

For a cold-load intro, open `about:blank`, start recording without a URL, and
then navigate with `agent-browser open "$VISUAL_URL"` while capture is active.
Reset the relevant lifecycle state first. Passing a URL to `record start` can
navigate before recording begins and miss the intro. Confirm the installed
version's behavior and that the recording actually includes the trigger.

Use FFmpeg to extract frames without resizing. A coarse overview helps locate
phase boundaries; keep native-rate frames for short glitches:

```bash
mkdir -p "$VISUAL_ARTIFACT_DIR/overview" "$VISUAL_ARTIFACT_DIR/frames"
ffprobe -v error -select_streams v:0 \
  -show_entries stream=width,height,r_frame_rate,avg_frame_rate:format=duration \
  -of json "$VISUAL_ARTIFACT_DIR/run.webm" > "$VISUAL_ARTIFACT_DIR/video-metadata.json"
ffmpeg -hide_banner -loglevel error -i "$VISUAL_ARTIFACT_DIR/run.webm" \
  -vf fps=10 "$VISUAL_ARTIFACT_DIR/overview/frame-%06d.png"
ffmpeg -hide_banner -loglevel error -i "$VISUAL_ARTIFACT_DIR/run.webm" \
  -fps_mode passthrough "$VISUAL_ARTIFACT_DIR/frames/frame-%06d.png"
```

Inspect the extracted images with an image-viewing tool. Frame filenames provide
ordering, not timing. Use `ffprobe -show_frames` with
`-show_entries frame=best_effort_timestamp_time -of json` to retain frame
timestamps when measuring drift. Extract bounded intervals for long recordings.
Increasing output fps does not recover uncaptured browser frames; the actual
capture cadence limits claims about transient defects.

Current agent-browser recording uses FFmpeg and requires the relevant encoders.
Use `agent-browser doctor` to diagnose missing browser or recording dependencies.
Stop recordings on failure to preserve partial evidence. Close only the session
created for this task when finished, using `agent-browser close` with that session.

## Reproducible capture

For comparisons, keep the browser version, OS, viewport, device pixel ratio,
zoom, color scheme, and reduced-motion preference consistent. Match route,
scroll position, authentication, storage, fixtures, and feature flags. Control
locale, fonts, time, randomness, and GPU settings when they affect the result.
Record meaningful differences that cannot be controlled.

Use a clean, reproducible starting state for each run. Prefer actions through
visible controls and stable locators, such as roles and accessible names. Wait
for user-visible readiness or an explicit app signal. A quiet network does not
prove that the UI is ready, and persistent connections can prevent network idle.
Bound waits so a broken flow produces a useful failure.

Wait for fonts and images that affect stable-state screenshots. When testing
loading or asset-swap behavior, start capture before readiness and include that
period. Choose the relevant desktop and narrow layouts for responsive changes;
check either side of a breakpoint when its behavior changes. Do not run every
browser and device unless the change or project requirements justify it.

## Inspecting appearance and interaction

Capture enough context to judge alignment, spacing, typography, wrapping,
clipping, overflow, stacking, image fit, and nearby content. Use focused crops
for detail alongside a view that exposes the surrounding layout. Full-page
captures help find off-screen regressions; viewport captures show what a user
actually sees in fixed, sticky, or scroll-dependent layouts.

For interactive UI, check the trigger, intermediate states where relevant, and
the settled result. Include the reverse action when affected. Pair visible
checks with relevant semantic assertions, such as focus placement, modal
presence, background inertness, disabled controls, or navigation state.
Semantic assertions cannot establish pixel appearance.

Use image diffs to locate changes, then inspect the underlying captures. For an
intentional redesign, assess the changed area against the requested design and
check preserved areas for regressions. Do not impose pixel equality on a region
whose appearance was supposed to change. Review a candidate baseline before
accepting it as the reference for future checks.

## Motion and animation parity

Use temporal evidence for any change to timing, easing, ordering, lifecycle, or
intermediate visual states. Record before the trigger. For an intro, cold load,
or route transition, recording must already be active before navigation or the
relevant lifecycle event. A recorder started after page readiness may miss the
entire behavior under review.

Watch the recorded flow or inspect a time-ordered frame sequence. Include the
initial state, phase boundaries, intermediate states, completion, and a settled
end state. Check repeated triggers, interruption, navigation away and back, or
one-time lifecycle behavior when the change affects them. Exercise the reduced
motion preference separately when relevant and confirm the UI remains usable.

For animation parity, retain baseline and candidate recordings, aligned frames,
comparison metadata, and a per-frame diff summary. Align both runs to the same
observable trigger. Preserve and report start/end drift; do not shift recordings
to conceal a delayed start. A frame number is not a measured event timestamp.

Record at 60 fps when available. Inspect every captured frame for intricate
animations, transitions, and quick interactions. For other behavior, select
enough frames to cover the full sequence and its risks. A 100 ms interval is
useful for an overview but can miss short transitions and single-frame flashes.
If 60 fps is unavailable, use the highest available rate, disclose the limit,
and leave claims that require 60 fps unverified. Record the actual capture rate
and limits; evidence cannot rule out events shorter than it can resolve.
Frame count equality alone does not establish timeline alignment. Forbidden
intermediate states fail parity within the limits of the capture.

Set acceptance thresholds before evaluating the candidate, using the project's
requirements and observed capture noise. There is no universal acceptable pixel
mismatch or timing drift. State the comparison region, pixel sensitivity,
mismatch limit, timing tolerance, and rationale when numeric checks are used.
Inspect critical frames even when aggregate mismatch is low. A small misplaced
control can pass a whole-page percentage check.

## Canvas, 3D, and WebGL

Verify the rendered canvas in the running browser or app. DOM inspection cannot
confirm a shader, texture, camera, lighting, compositing, or particle change.
Include the affected interaction, resize behavior, and any relevant loading or
fallback state. Do not infer frame rate or smoothness from a still image; use
runtime measurements if making a performance claim.

For repeatable comparisons, control the camera, viewport, simulation time,
random seed, and asset readiness where practical. A fixed-time capture can
verify appearance, but normal playback is still needed to verify motion.
Separate stable UI comparisons from unavoidable decorative noise. Document any
mask or crop and inspect the excluded region separately. Never mask the change
under review, meaningful choreography, or brand-critical motion to obtain a pass.

## Evidence record

Keep the record small enough to maintain. A simple static change can use a short
task note with a screenshot link. A complex flow can use this structure in the
project's artifact directory:

```text
visual/<flow>/<run>/
  evidence.md
  baseline/
  candidate/
  diffs/
```

Record what another reviewer needs to reproduce or assess the result:

- Expected result, intentional differences, and states covered.
- URL or app view, build identity, capture time, and relevant environment settings.
- Actions and readiness conditions, plus baseline provenance when comparing.
- Paths to inspected screenshots, recordings, or frames and useful timestamps.
- Assertions, comparison settings, exclusions, observed defects, and outcome.
- Missing coverage or limitations, including absent baselines or unavailable tools.

Retain only relevant artifacts and follow the repository's rules for committing
or attaching them. Avoid placing sensitive page content in shared evidence.

## Existing animation helpers

The bundled scripts are optional compatibility helpers for repositories already
using `.cursor/docs/animation-behavior-spec.md` and
`.cursor/artifacts/animations/<flow>/`. Other artifact locations are valid.
Use agent-browser and FFmpeg as required, with the disclosed Playwright fallback
when agent-browser is unavailable. The bundled scripts require agent-browser;
use the fallback separately if needed. Resolve scripts relative to the actual
skill directory; no specific harness or installation path is required.

Use a running original and candidate site, the `agent-browser` CLI,
FFmpeg, and Node packages `pixelmatch` and `pngjs`. Confirm that Node can resolve
those packages from `scripts/diff-frames.mjs`. Do not add package scripts or
install a toolchain solely for a static change.

For an existing animation workflow, invoke the helpers from the target repo:

```bash
# Set ANIMATION_SKILL_DIR to the absolute directory containing this SKILL.md.
export ORIGINAL_URL=http://localhost:4000
export MIGRATED_URL=http://localhost:3000
bash "$ANIMATION_SKILL_DIR/scripts/animation/review-flow.sh" menu-open
```

The wrapper checks that the canonical spec exists, has no recognized template
markers, and contains a `### menu-open` section. It copies the spec into the
artifacts, records both runs, extracts frames, and invokes the diff helper.
These checks do not validate the substance or completeness of the spec.

Recorder actions resolve first from `.cursor/animation/flows/<flow>.sh`, then
from `scripts/animation/flows/<flow>.sh` inside the skill. A flow script must be
executable and receives the session name as its first argument. It must perform
the same actions for both implementations. Session-specific element references
must be discovered again in each run.

Account for these limitations before relying on the helpers:

- The recorders start capture on a blank page before navigating. Confirm the
  resulting recording includes the trigger and the intended cold-load state.
- Without a flow script, a recorder captures only an idle pause. It does not
  exercise a menu, modal, or other interaction.
- The recorders use font readiness and fixed waits. Confirm the actual starting
  state; adapt the agent-browser flow when these waits are unsuitable.
- Metadata includes requested viewport and DPR settings, but does not verify
  the actual environment or control all settings listed above.
- Extraction defaults to 60 fps without resizing. `ANIMATION_FPS` can select a
  different extraction rate, but cannot recover frames absent from the recording.
- The diff helper compares frames by index without trigger alignment. Its
  timestamps describe sampling positions, not measured animation events.
- The recorders use task-specific sessions and close them after capture.
- The diff helper's `passed` value checks equal frame counts and a peak mismatch threshold,
  defaulting to 3%. It does not enforce mean mismatch, timing drift, semantic
  behavior, or visual inspection. Verify aligned frames and assess the full result.

For direct extraction and comparison, the individual commands remain available:

```bash
bash "$ANIMATION_SKILL_DIR/scripts/animation/extract-frames.sh" menu-open
node "$ANIMATION_SKILL_DIR/scripts/diff-frames.mjs" \
  .cursor/artifacts/animations/menu-open/original/frames \
  .cursor/artifacts/animations/menu-open/migrated/frames \
  .cursor/artifacts/animations/menu-open/diffs/timeline
```

## Official guidance

These sources inform the workflow. The evidence requirements are this skill's
policy; the sources do not prescribe a universal visual acceptance threshold.

- [agent-browser commands](https://agent-browser.dev/commands) and
  [recording guidance](https://agent-browser.dev/recording) describe browser
  actions, screenshots, FFmpeg requirements, and recording lifecycle. The
  installed CLI's skill content and help establish locally supported options.
- [FFmpeg filters](https://ffmpeg.org/ffmpeg-filters.html#fps),
  [image sequence output](https://ffmpeg.org/ffmpeg-formats.html#image2-2), and
  [ffprobe](https://ffmpeg.org/ffprobe.html) document frame extraction, sampling,
  and media metadata.
- [OpenAI skill authoring](https://learn.chatgpt.com/docs/build-skills) recommends
  focused skills, clear invocation descriptions, imperative instructions, and
  progressive disclosure. Keep the required workflow in `SKILL.md` and load
  specialized detail from this reference only when relevant.
- [Playwright best practices](https://playwright.dev/docs/best-practices) favors
  user-visible behavior, isolated runs, stable locators, and retrying assertions.
  Its [navigation API](https://playwright.dev/docs/api/class-page#page-goto)
  discourages relying on network idle for test readiness.
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)
  explains rendering variability and matching the baseline environment.
  [Screenshot assertions](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-1)
  disable animations by default and can fast-forward finite animations. Use
  that behavior deliberately for stable appearance checks. Verify actual motion
  separately with animations running; an animation-disabled screenshot cannot
  prove timing or intermediate states.
- [MDN on reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Using_for_accessibility)
  explains the `reduce` preference and minimizing nonessential motion. Check
  the intended reduced-motion experience rather than suppressing all motion
  globally just to stabilize a capture.
