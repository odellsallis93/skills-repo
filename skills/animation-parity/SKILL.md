---
name: animation-parity
description: Verify aesthetic changes using agent-browser for browser checks and screenshots, plus FFmpeg for motion evidence. Use for changes to UI styling, layout, typography, responsive appearance, animation, transitions, canvas, 3D, or WebGL, including unintended visual changes.
---

# Visual verification

Every aesthetic change needs direct confirmation of the rendered result. Use this
workflow when styling or appearance changes, including unintended layout or visual
changes caused by functional code. Check preservation when a refactor can affect
appearance. A purely functional or text change with no aesthetic effect does not
trigger this workflow.

## Required tools

Use `agent-browser` for browser navigation, interaction, screenshots, and video
capture. If agent-browser is unavailable, inform the user and use Playwright.
Ask for authorization before using other alternatives to either agent-browser or
FFmpeg. Use FFmpeg to extract frames from recordings, then inspect those images
when motion or intermediate states matter. Static changes need inspected
screenshots without a mandatory video. Use `ffprobe` to check dimensions, rate, and
timestamps when needed. Read the installed CLI's `agent-browser skills get core`
before browser work and consult command help for version-specific options.
See [reference.md](reference.md#agent-browser-and-ffmpeg) for capture recipes.

## Choose evidence that proves the change

| Change | Minimum confirmation |
| --- | --- |
| Static appearance, such as spacing, color, typography, images, or layout | Open and inspect fresh screenshots or rendered previews of the affected result. Include enough surrounding context to expose layout regressions. |
| Interactive or responsive UI, such as menus, forms, overlays, or breakpoints | Exercise the affected flow in a running browser or app and inspect screenshots of the relevant states and viewport sizes. |
| Motion, transitions, scroll effects, or animated canvas, 3D, or WebGL | Exercise the running flow. Record at 60 fps and inspect FFmpeg-extracted frames covering the trigger, intermediate behavior, and final state. Inspect every captured frame for intricate animation, transitions, and quick interactions. |
| Migration or refactor that must preserve visual behavior | Compare baseline and candidate evidence under matched conditions. Add aligned frames and measured timing when claiming animation parity. |

Combine rows when a change spans them. A screenshot is enough for a static color
change; it cannot establish transition timing. Match the depth of verification
to the affected behavior and likely failure modes. Text-only edits with no
effect on rendered output do not need this workflow.

## Verification workflow

1. **Define the expected result.** Identify affected routes, components, states,
   and relevant viewports. Use the user's request and existing design references
   to distinguish intentional changes from behavior that must remain intact.
   Ask only when unresolved product intent would materially change the result.
2. **Capture a useful baseline.** For an existing UI, inspect and capture the
   affected state before editing when possible. If edits already exist, use an
   isolated original build or existing evidence without discarding user work.
   For new UI or an unavailable baseline, verify against the requested result
   and disclose that no before/after parity comparison was possible.
3. **Run the actual result.** Start the project's existing preview and use
   agent-browser to verify browser output. For a native app, use its supported
   live inspection tools. Confirm the intended route, build, and state. Wait for
   observable readiness, including relevant fonts and assets, rather than
   treating a successful build, arbitrary sleep, or network idle as proof.
4. **Exercise affected states.** Follow the user's path through the change.
   Check the relevant responsive widths and nearby layout. For shared styles
   or components, include representative consumers. Cover focus, hover, open,
   closed, loading, empty, error, and disabled states only where affected.
   For motion, include repeat or interrupted triggers and reduced motion where
   relevant. See [reference.md](reference.md) for capture and comparison details.
5. **Capture and inspect.** Open the screenshots, preview, recording, or frames
   with a tool that displays their visual contents. Check the changed region
   and its context against the expectation. For motion, inspect the sequence,
   not just its endpoints. DOM snapshots, computed styles, console output,
   automated diffs, and tests support this inspection; none replaces it.
6. **Fix and recheck.** Correct unintended differences and repeat the affected
   checks. Evidence must come from the final implementation. If a later edit
   affects the result, refresh the relevant evidence before claiming success.

For a simple edit, keep the expected result and evidence record in the task
notes. For complex motion or parity work, use an existing behavior specification
or [behavior-spec-template.md](behavior-spec-template.md) to record the affected
flows before implementation. Complete relevant fields from observation or
confirmed requirements. Mark genuine unknowns and distinguish them from facts.
Do not require a new specification or animation toolchain for every CSS edit.

## Evidence and completion

Retain the captures used for inspection in the project's established artifact
location. If there is none, use a task artifact directory and report its path.
For each checked flow, record the route or preview, implementation revision or
build identity, viewport, relevant settings, actions, evidence paths, and outcome.
Record additional comparison conditions only where they matter.

Report one of these outcomes for each affected flow:

- **Verified:** the required rendered and live checks passed on the final result,
  with inspected evidence linked or located.
- **Failed:** observed differences or behavior violate the expected result.
- **Unverified:** required checks could not run, evidence could not be inspected,
  or coverage remains incomplete. State the specific blocker and missing check.

A build, test pass, generated capture, or helper script's `passed` flag alone
does not establish visual verification. Never invent observations or describe
uninspected evidence as reviewed. Do not weaken thresholds, hide the changed
region, or replace baselines merely to make a comparison pass.

If agent-browser is unavailable, disclose the Playwright fallback. If FFmpeg or
capture access is unavailable, resolve the setup within the task's permissions
or request authorization for another approach. Continue useful authorized work,
but keep affected claims unverified until the required evidence is inspected.
If 60 fps capture is unavailable, use the highest available rate and disclose
the limit; leave claims that require 60 fps unverified. For parity, forbidden
intermediate states are failures, within the limits of the capture.
Require user review only when acceptance depends on unresolved design judgment
or the user requests it.

In the final response, state what was checked, the observed result, evidence
locations, and any remaining gaps. Limit the claim to the states and environments
actually inspected.
