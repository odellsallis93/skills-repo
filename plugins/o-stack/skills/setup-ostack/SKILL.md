---
name: setup-ostack
description: >-
  Write Cursor's per-role model rule for o-stack (`~/.cursor/rules/ostack-models.mdc`).
  Use for /setup-ostack, "setup ostack", "configure ostack models", or "ostack budget".
  Repo issue tracker, triage labels, and domain docs are /setup-odell-skills.
  Do not use this skill in Codex — that is /setup-pstack.
disable-model-invocation: true
---

# Setup o-stack models

Write `~/.cursor/rules/ostack-models.mdc`, the per-role model rule o-stack skills read. This skill does not configure the repo. For issue tracker, triage labels, and domain docs, run `/setup-odell-skills`. In Codex, run `/setup-pstack` instead of this skill.

Explore, show one list with one recommended option, then write. Do not draft files and wait for a second approval after they accept an option.

## 1. Explore

- Enumerate model slugs you can pass to a `Task` subagent in this session. That is the dependable source. If Cursor exposes a models API or CLI of entitled models, prefer it for completeness. If you cannot detect any, ask the user to paste the slugs they have. Never write a real slug you have not confirmed. `inherit-parent` and `auto` are always valid.
- If `~/.cursor/rules/ostack-models.mdc` exists, its `# budget` line and role values are the current choices. Else if `~/.cursor/rules/pstack-models.mdc` exists, treat that as the current choices and write the result to `ostack-models.mdc`. Otherwise start from the defaults in the rule shape below. Drop a role that is not in that shape (retired roles such as `how critics`).
- Offer a verification skill in the list only when this repo has no `verify-*` skill and no existing harness.

Recommended value for each item:

| Item | Recommended value |
| --- | --- |
| ostack budget | The budget already in the rule. If none: `unlimited — keep max`. |
| ostack role map | Current role lines, else the defaults below, then apply the recommended budget. |
| Verification skill | Skip. Offer it in the list only when this repo has no `verify-*` skill and no existing harness. |

Budget application: `unlimited` leaves every effort as in the working table. `large`, `medium`, and `small` set the effort token of every real slug, panel entries included, to `xhigh`, `high`, or `medium`. The effort token is the last token, or the one before a trailing `fast`, on the ladder `max` > `xhigh` > `high` > `medium` > `low`. If the result is not a detected slug, use the same family's detected slug with the highest effort at or below the target, else mark the role as needing a choice. Treat `cursor-grok-*` as the grok family. `inherit-parent` and `auto` do not change. On a re-run, keep any role already changed by family, list, or alias.

## 2. Ask once

Prefer AskQuestion. Put the list in the prompt: one line per item, recommended value included. Lead with the recommended option.

Options, in this order:

1. **Recommended** — set up every row above using its recommended value, then write
2. **Change the recommendations** — ask only about the rows they want to change, then write

If AskQuestion is unavailable, ask the same thing in chat and wait.

On **Recommended**, write immediately. Recommended does not generate a verification skill. The only extra question allowed is for an ostack role whose real slug is not in the detected set: ask those roles only, offering detected models plus `inherit-parent` and `auto`, then write. If they opted into the verification skill, invoke `/create-verification-skill` after the writes.

On **Change the recommendations**, ask which rows to change (multi-select), including the verification skill when it is on the list. Then one AskQuestion per selected row. Put the recommended value first and mark it `(Recommended)`. For the verification skill the recommended value is skip; the other choice is generate one with `/create-verification-skill` after the writes.

- ostack budget, exact labels: `unlimited — keep max`, `large — xhigh reasoning`, `medium — high reasoning`, `small — medium reasoning`.
- ostack role map: show every role with its model. Panel roles (`arena runners`, `architect runners`, `interrogate reviewers`) are lists; one subagent runs per entry, so the length sets the count. `arena cross-judge pool` is a list from which Arena selects one value whose model family differs from the parent's when possible. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

## 3. Write the ostack rule

Every real slug must be in the detected set. `inherit-parent` and `auto` always pass. If a chosen real slug is not available, stop and ask again.

Overwrite `~/.cursor/rules/ostack-models.mdc` with `alwaysApply: true`, a `# budget` line, and one line per role. Same labels poteto-mode uses. If `~/.cursor/rules/pstack-models.mdc` still exists, delete it so only this rule applies. Shape:

```
---
description: ostack per-role model choices (overrides skill defaults)
alwaysApply: true
---
# ostack model configuration. One line per role. Delete a line to fall back to the skill default.
# `inherit-parent` or `auto` as a value: the role runs on the parent chat model (omit Task `model`). Alias entries in a panel list still count toward its fan-out.
# budget: medium (high)
feature, refactoring: cursor-grok-4.6-high-fast
bug-fix: cursor-grok-4.6-high-fast
perf-issue: cursor-grok-4.6-high-fast
hillclimb: cursor-grok-4.6-high-fast
judgment and prose: claude-opus-5-5-high-fast
hardest tasks: claude-opus-5-5-high-fast
how explorer: cursor-grok-4.6-high-fast
how explainer: claude-opus-5-5-high-fast
why investigators: cursor-grok-4.6-high-fast
why synthesizer: claude-opus-5-5-high-fast
reflect tooling: gpt-5.6-sol-high-fast
reflect judgment, divergent, synthesizer: claude-opus-5-5-high-fast
arena runners: claude-opus-5-5-high-fast, gpt-5.6-sol-high-fast, cursor-grok-4.6-high-fast
arena cross-judge pool: claude-opus-5-5-high-fast, gpt-5.6-sol-high-fast, cursor-grok-4.6-high-fast
swarm workers: cursor-grok-4.6-high-fast
architect runners: claude-opus-5-5-high-fast, gpt-5.6-sol-high-fast, cursor-grok-4.6-high-fast
interrogate reviewers: claude-opus-5-5-high-fast, gpt-5.6-sol-high-fast, cursor-grok-4.6-high-fast
```

Set `# budget:` to the chosen label and its target effort: `unlimited (max)`, `large (xhigh)`, `medium (high)`, or `small (medium)`.

## 4. Done

Say what was written and that the ostack rule applies to new sessions. They can edit the rule directly. Re-run this skill to change it. Repo config is `/setup-odell-skills`.
