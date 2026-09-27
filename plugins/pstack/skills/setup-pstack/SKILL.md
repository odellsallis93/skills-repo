---
name: setup-pstack
description: Configure Codex models per P-stack role and optionally enable global poteto-mode routing. Use for setup-pstack or changing P-stack model choices.
---

# Set up P-stack for Codex

Repo issue tracker, triage labels, and domain docs are `/setup-odell-skills`. This skill only writes Codex per-role models.

Read `../poteto-mode/references/codex-tools.md` first.

Write `~/.codex/pstack-models.md`, which overrides P-stack's inline model defaults. The file is optional. A missing role uses the defaults in the Codex mapping.

## 1. Detect models

Inspect the live Codex model choices exposed by the subagent and task tools. Record each model's supported reasoning efforts. Never write a model or reasoning pair that is not available on the current host. `inherit-parent` and `auto` are always valid aliases and mean that the worker omits model and reasoning overrides.

## 2. Load current choices

Read `~/.codex/pstack-models.md` when it exists. Otherwise start from the defaults below.

## 3. Confirm choices

Show every role and its current model. Mark unavailable pairs. Ask whether to accept them or change specific roles. Panel values are lists, and one worker runs per entry. Keep panels diverse when possible.

## 4. Validate

Every explicit model and reasoning effort must be supported by the current host. Stop and ask again if a chosen pair is invalid.

## 5. Write the configuration

Overwrite `~/.codex/pstack-models.md` so reruns are idempotent. Use this shape:

```markdown
# P-stack model configuration for Codex
# Delete a line to use the skill default. `inherit-parent` and `auto` omit overrides.
feature, refactoring: gpt-5.6-luna/max
bug-fix: gpt-5.6-sol/max
perf-issue: gpt-5.6-sol/max
hillclimb: gpt-5.6-sol/max
judgment and prose: gpt-5.6-sol/ultra
hardest tasks: gpt-5.6-sol/ultra
how explorer: gpt-5.6-luna/max
how explainer: gpt-5.6-sol/ultra
how critics: gpt-5.6-sol/ultra, gpt-5.5/xhigh, gpt-5.4/xhigh, gpt-5.6-luna/max
why investigators: gpt-5.6-luna/max
why synthesizer: gpt-5.6-sol/ultra
reflect tooling: gpt-5.6-sol/max
reflect judgment, divergent, synthesizer: gpt-5.6-sol/ultra
arena runners: gpt-5.6-sol/ultra, gpt-5.5/xhigh, gpt-5.4/xhigh, gpt-5.6-luna/max
arena cross-judge pool: gpt-5.6-sol/ultra, gpt-5.5/xhigh, gpt-5.4/xhigh, gpt-5.6-luna/max
swarm workers: gpt-5.6-luna/max
architect runners: gpt-5.6-sol/ultra, gpt-5.5/xhigh, gpt-5.4/xhigh, gpt-5.6-luna/max
interrogate reviewers: gpt-5.6-sol/ultra, gpt-5.5/xhigh, gpt-5.4/xhigh, gpt-5.6-luna/max
```

## 6. Offer global routing

Ask whether the user wants poteto-mode to route non-trivial engineering work automatically.

If they decline, do not edit `~/.codex/AGENTS.md`. P-stack remains explicit.

If they accept, show this exact block before writing it:

```markdown
## P-stack routing

For a non-trivial engineering task, invoke `pstack:poteto-mode` before acting and follow its selected playbook. Skip it for casual questions, trivial one-step edits, or when the user opts out. Delegated workers follow the parent brief and do not auto-route unless the brief explicitly requests poteto-mode. Explicit user instructions take precedence.
```

Append the block only if an equivalent block is absent. Preserve all existing global instructions. Add a reference to `~/.codex/pstack-models.md` only if the Codex instruction loader supports file references in the current version. Otherwise the P-stack skills read the configuration directly.

## 7. Confirm

Tell the user what was written and that a new task is the safest place to verify plugin and global-instruction pickup.

Offer `pstack:create-verification-skill` once when the current project lacks a real-artifact verification harness.
