# Visual behavior specification

Use this template for complex visual flows or animation parity. For a simple
static change, a short expected-result and evidence note is sufficient. Fill
relevant fields, remove unused rows, and replace template markers before use.
Write `Not applicable` with a reason where a required section does not apply.

For the optional `review-flow.sh` helper, save this at
`.cursor/docs/animation-behavior-spec.md` and use plain lowercase kebab-case flow
names in level-three headings. Its checks cannot establish spec completeness.

## Scope and expected result

- Owner and updated date, if useful:
- Affected routes, components, and shared consumers:
- Requested result and intentional differences:
- Existing behavior to preserve:
- Evidence sources and baseline provenance:
- Unresolved questions and their effect on verification:

## Capture conditions

- Baseline and candidate build identities and URLs or app views:
- Browser or app version, OS, viewport, and device pixel ratio:
- Color scheme, reduced motion, and relevant responsive widths:
- Route, scroll, authentication, storage, data, and feature flags:
- Readiness conditions for fonts, images, and application state:
- agent-browser session, viewport, and recording settings:
- Time, randomness, simulation, and GPU controls where relevant:
- Uncontrolled differences and comparison limitations:

## Flows

### <flow-name>

#### Expected appearance and behavior

- Trigger and preconditions:
- Reproducible actions and readiness signals:
- Initial, intermediate, and final appearance:
- Surrounding layout and preserved behavior:
- Relevant semantic assertions, including focus or modal state:
- Forbidden visible states or regressions:

#### Motion and lifecycle, when applicable

| Trigger-relative time or phase | Visible behavior | Semantic state | Evidence or assertion |
| --- | --- | --- | --- |
| Before trigger | | | |
| Intermediate phase | | | |
| Settled result | | | |

- Duration, delay, easing, and ordering where required:
- Cold load, repeat, interruption, and navigation behavior where affected:
- Reduced-motion behavior:
- Recording start, trigger alignment, capture rate, and sampling limits:

#### Acceptance and evidence

- Basis for acceptance, including design reference or observed baseline:
- Screenshots, recording, or frame sequence required for this flow:
- agent-browser actions and FFmpeg extraction commands where applicable:
- Comparison regions, masks, numeric tolerances, and rationale where used:
- Critical states or timestamps requiring inspection:
- Artifact directory and reproduction command or procedure:

#### Verification result

- Implementation identity, capture time, and actual environment checked:
- Actions performed and assertions checked:
- Evidence paths and visual observations:
- Measured differences and timing drift where applicable:
- Outcome, verified, failed, or unverified:
- Missing checks, limitations, or unresolved defects:

## Completion check

- [ ] Expected behavior distinguishes observed facts from requested changes.
- [ ] Evidence covers affected states and comes from the final implementation.
- [ ] Visual contents were inspected and relevant live flows were exercised.
- [ ] Comparisons use suitable conditions, alignment, and stated tolerances.
- [ ] The reported outcome discloses missing coverage and unresolved defects.
- [ ] Record approval here if the project or user requires it.
