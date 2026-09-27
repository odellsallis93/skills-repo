---
name: setup-odell-skills
description: >-
  Configure this repo for the Odell skills: issue tracker, triage labels, and
  domain docs. Use for /setup-odell-skills, "setup odell skills", or the retired
  names /setup-ostack-skills and /setup-matt-pocock-skills. Does not write
  per-role model rules — those are /setup-ostack (Cursor) and /setup-pstack
  (Codex).
---

# Setup Odell skills

Configure the repo the Odell skills assume:

- **Issue tracker**: where `to-tickets`, `triage`, and `to-spec` read and write
- **Triage labels**: mapping from the five canonical roles to this tracker's labels (only if `triage` is installed)
- **Domain docs**: single-context or multi-context layout

This skill does not write per-role model rules. In Cursor run `/setup-ostack`. In Codex run `/setup-pstack`. Do not look for `setup-matt-pocock-skills` or `setup-ostack-skills`.

Explore, show one list with one recommended option, then write. Do not draft files and wait for a second approval after they accept an option.

## 1. Explore

Read what is already there. Do not assume.

- `git remote -v` and `.git/config`: GitHub, GitLab, or neither, and which repo
- `AGENTS.md` and `CLAUDE.md`: which exists, and whether `## Agent skills` is already present
- `CONTEXT.md`, `CONTEXT-MAP.md`, `docs/adr/`, and any `src/*/docs/adr/`
- `docs/agents/`: prior output of this skill (`issue-tracker.md`, `triage-labels.md`, `domain.md`)
- `.scratch/`: local-markdown issue tracker already in use
- Is `triage` installed? A `triage` skill folder in `~/.cursor/skills`, `~/.agents/skills`, `~/.claude/skills`, or the available skills. If it is not installed, triage labels are not a setup item.
- Monorepo signals: `pnpm-workspace.yaml`, a `workspaces` field in `package.json`, or a populated `packages/*` with its own `src/`. Absent those, the repo is single-context.

Recommended value for each item:

| Item | Recommended value |
| --- | --- |
| Issue tracker | What `docs/agents/issue-tracker.md` already records. If none: GitHub when the remote is GitHub, GitLab when it is GitLab, otherwise local markdown. |
| Triage labels | The mapping already in `docs/agents/triage-labels.md`. If none: the five defaults. Omit this row when `triage` is not installed. |
| Domain docs | The layout already named in the `## Agent skills` block. If none: single-context. Recommend multi-context only when `CONTEXT-MAP.md` already exists. |

## 2. Ask once

Prefer AskQuestion. Put the list in the prompt: one line per item, recommended value included. Lead with the recommended option.

Options, in this order:

1. **Recommended** — set up every row above using its recommended value, then write
2. **Change the recommendations** — ask only about the rows they want to change, then write

If AskQuestion is unavailable, ask the same thing in chat and wait.

On **Recommended**, write immediately.

On **Change the recommendations**, ask which rows to change (multi-select). Then one AskQuestion per selected row. Put the recommended value first and mark it `(Recommended)`.

- Issue tracker: GitHub, GitLab, local markdown, or other. One-line explainer: this is where `to-tickets`, `triage`, and `to-spec` read and write. GitHub uses `gh`. GitLab uses `glab`. Local markdown uses `.scratch/<feature>/`. Other: they describe the workflow in one paragraph.
- Triage labels, only if `triage` is installed: keep the defaults, or collect overrides so existing tracker labels are reused. Defaults: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`.
- Domain docs: ask only when monorepo signals exist or they asked to change this row. Single-context is one `CONTEXT.md` plus `docs/adr/` at the repo root. Multi-context is a root `CONTEXT-MAP.md` pointing at per-context `CONTEXT.md` files.

Leave the GitHub/GitLab "PRs as a request surface" flag **off**. Do not ask about it.

## 3. Write repo config

Pick the file to edit:

- If `CLAUDE.md` exists, edit it.
- Else if `AGENTS.md` exists, edit it.
- If neither exists, ask which one to create. Do not pick for them.

Never create `AGENTS.md` when `CLAUDE.md` already exists, or the reverse. If `## Agent skills` already exists, update it in place. Do not overwrite the surrounding sections.

```markdown
## Agent skills

### Issue tracker

[one-line summary]. See `docs/agents/issue-tracker.md`.

### Triage labels

[one-line summary]. See `docs/agents/triage-labels.md`.

### Domain docs

[single-context or multi-context]. See `docs/agents/domain.md`.
```

Omit `### Triage labels` and `docs/agents/triage-labels.md` when `triage` is not installed.

Write the docs from the seed templates in this folder, keeping user prose that already matches the chosen tracker:

- [issue-tracker-github.md](./issue-tracker-github.md)
- [issue-tracker-gitlab.md](./issue-tracker-gitlab.md)
- [issue-tracker-local.md](./issue-tracker-local.md)
- [triage-labels.md](./triage-labels.md) when triage labels are in scope
- [domain.md](./domain.md)

For another tracker, write `docs/agents/issue-tracker.md` from their paragraph.

## 4. Done

Say what was written. Odell skills read `docs/agents/*.md`. Per-role model rules are `/setup-ostack` (Cursor) and `/setup-pstack` (Codex). Re-run this skill to change the repo setup.
