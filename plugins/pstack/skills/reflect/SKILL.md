---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
---

# Reflect

> **Codex platform:** Read `../poteto-mode/references/codex-tools.md` before following Cursor-specific tool, model, transcript, control, loop, or subagent instructions.

Mine the current conversation for durable learnings, then route them into skill edits.

## When to invoke

- The user said "reflect" or "/reflect".
- A complex task (5+ tool calls) just landed cleanly and the recipe is worth keeping.
- The agent hit dead ends, found the working path, and the path generalizes.
- The user corrected the agent's approach mid-task.
- A non-trivial workflow emerged that isn't captured anywhere.

Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## Process

### 1. Load the active task

Use the current conversation context directly. When a fuller record is needed, identify the exact current task with `list_threads` and read it with `read_thread`. Paginate only as far as the reflection requires. If task reading is unavailable, write a tight session digest and pass that instead. Do not inspect unrelated recent tasks.

### 2. Spawn three reviewers in parallel

Issue three `spawn_agent` calls in the same turn with explicit model and reasoning pairs. The briefs prohibit file writes but allow relevant connectors for citation checks. The parent applies approved edits.

| Lens | `model` | Prompt template |
|---|---|---|
| Judgment | your configured reflect-judgment model (default `gpt-5.6-sol/ultra`) | `references/judgment-reviewer.md` |
| Tooling | your configured reflect-tooling model (default `gpt-5.6-sol/max`) | `references/tooling-reviewer.md` |
| Divergent | your configured reflect-judgment model (default `gpt-5.6-sol/ultra`) | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the task transcript or digest where marked. Reviewers return findings to the parent.

### 3. Synthesize

Spawn one synthesizer using the configured reflect-judgment model, default `gpt-5.6-sol/ultra`. Its brief prohibits file writes but allows connector access to spot-check citations. Use `references/synthesizer.md` verbatim with the reviewer outputs. It returns a structured Accepted / Rejected / Backlog list.

### 4. Structural enforcement check

Sanity-check the synthesizer's Accepted list. For any item that would be enforced more reliably by a lint rule, script, metadata flag, or runtime check, move it from Accepted to Backlog. The synthesizer already applies this criterion; this is a final pass before edits land. See the **encode-lessons-in-structure** principle skill.

### 5. Apply

Before applying any Accepted edit, present the synthesizer's full Accepted/Rejected/Backlog output to the user and wait for explicit approval. The user picks which subset to apply and may redirect routings. Skill changes affect every future agent in the org; do not auto-apply.

File backlog items only when the user explicitly authorized tracker writes. Otherwise return them as proposed backlog items.

For each approved Accepted item, follow the Routing field exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): parent does directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): hand to Codex's `skill-creator` skill and run its draft / test / iterate loop.
- `tune description: <skill path>` (the skill exists but did not trigger): hand to `skill-creator` and run its description-optimization loop.
- `new skill via skill-creator: <kebab-name>`: hand creation to `skill-creator`. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done. Skip this step if it doesn't.

### 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
