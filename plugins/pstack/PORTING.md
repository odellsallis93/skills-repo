# Codex porting notes

## Baseline

- Upstream plugin version: 0.14.5
- Audited repository snapshot: `68836ddaf5697224520f1847d90cdb90ca8babaa`
- Last P-stack change in that snapshot: `6fecddba65801f9b9c08b8b328d998ee5b09d290`
- Previous community Codex port reviewed: `michael-denyer/pstack-claude` at `8bf501c1a9f6777f63f8d9a705c2b3f54a5b2eac`

This port starts from the official Cursor tree, not the older Claude-oriented fork. The previous port's useful ideas were retained where they still fit, but its Claude model names, Claude transcript paths, Claude built-ins, command trampolines, and SessionStart hook are not carried forward.

## Closer parity improvements

- All upstream 0.11.3 through 0.14.5 skill and playbook changes are present.
- The official PR watcher, orchestration store, bootstrap script, worktree audit, and their tests are present.
- `swarm`, `no-comments`, `technical-writing`, `bro`, Comment Sicko, and the current poteto-agent wrapper are present.
- The current four-model panel design is preserved using Codex model and reasoning-effort pairs.
- Cursor task transcripts are mapped to Codex task listing and reading tools instead of to Claude filesystem transcripts.
- Cursor `Task` fan-out maps directly to Codex subagents, including parallel calls and model overrides.
- Cursor UI and CLI control skills map to Codex Browser, Computer Use, and terminal execution.
- Cursor's built-in skill-authoring flow maps to Codex skill-creator.
- Cursor's Bugbot and security-review routes map to the corresponding Codex review skills when available.
- Cursor's `/loop` behavior maps to the Codex loop skill or a task heartbeat automation.
- The new `make-bot-ui` skill retains the webhook-triggered UI workflow through Codex Automations without Cursor-only secret cards or automatic privileged installation.
- The 0.14.5 multi-phase planning contract and its executable `check-plan.mjs` validator are present.
- Only the `deslop` Cursor Team Kit dependency that P-stack directly invokes is bundled. Five unrelated companion workflows from the older port were removed.

## Boundaries

- Codex plugins do not currently register Cursor-style custom subagent types. Delegated workers are instructed to load `pstack:poteto-agent` or `pstack:comment-sicko` explicitly.
- Upstream uses `disable-model-invocation: true` on explicit-only skills. Codex plugin validation rejects that SKILL.md field, so this port uses each skill's `agents/openai.yaml` with `policy.allow_implicit_invocation: false`. The three port-only dependency and wrapper skills use the same policy.
- Codex does not expose Cursor's plugin sticky-mode frontmatter. Always-on routing is an opt-in global AGENTS.md rule.
- Codex subagents do not expose Cursor's `readonly`, `environment: cloud`, or `run_in_background` flags. The compatibility map preserves their intent through prompts and Codex's concurrent subagent behavior.
- Durable user-owned Codex tasks are only created when the user explicitly requests them. Ordinary P-stack fan-out uses subagents in the current task.
- Benny remains dormant until the user explicitly creates Codex automations and connects Slack.
- Cursor's bot UI secret-request card has no Codex equivalent. Bot servers read secrets from an environment, OS keychain, or existing secret manager and never place them in chat or the project.
- Upstream's automatic Bun install is replaced by a fail-closed explicit setup instruction. Upstream's worktree audit network refresh is opt-in through `--refresh`.
