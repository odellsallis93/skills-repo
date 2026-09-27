# skills-repo

Source of truth for Odell skills, harness-only skills, the **o-stack** Cursor plugin, and the **pstack** Codex port. Clone it, run `bin/install`, and Atomic, Codex, Claude Code, and Cursor load the same files.

Terms are defined in [CONTEXT.md](./CONTEXT.md). Why Codex-only skills are a plugin: [docs/adr/0001-codex-harness-skills-ship-as-plugin.md](./docs/adr/0001-codex-harness-skills-ship-as-plugin.md). Why install uses per-skill symlinks: [docs/adr/0002-symlink-each-skill-from-the-clone.md](./docs/adr/0002-symlink-each-skill-from-the-clone.md).

## Layout

```
skills/                  Odell skills (every harness)
harness/cursor/skills/   Cursor-only
harness/atomic/skills/   Atomic-only
plugins/o-stack/         Cursor stack
plugins/pstack/          Codex stack
plugins/odell-codex/     Codex-only ports of Cursor built-ins
templates/               Project skill sets to copy into a repo
third-party.json         Third-party skills by source; not stored here
```

## Install

```bash
git clone https://github.com/odellsallis93/skills-repo.git
cd skills-repo
./bin/install --dry-run
./bin/install
```

The installer:

- Symlinks each Odell skill into `~/.agents/skills` and `~/.claude/skills`
- Copies each Odell skill into `~/.cursor/skills` so Cursor Cloud Agents get real files
- Symlinks Cursor-only and Atomic-only skills into their private folders
- Points Cursor at `plugins/o-stack` and writes a Codex marketplace for `pstack` and `odell-codex`
- Moves colliding real folders to `~/.skills-backup/<timestamp>/`
- Leaves built-ins and third-party skills alone

Re-run it after pulling. It is safe to re-run.

### Third-party skills

Listed in `third-party.json`. Install them yourself:

```bash
npx skills add vercel-labs/agent-browser -g
npx skills add vercel-labs/skills -g
```

### Project skill templates

Copy a directory from `templates/` into the project (`.agents/skills`, `.cursor/skills`, or `.claude/skills`). After that the project owns the copy.

## Edit a skill

Change the files under `skills/`, `harness/`, or `plugins/`. Codex, Claude, and Atomic see symlink targets immediately. Cursor Cloud Agents (and Cursor's `~/.cursor/skills` copies) update on the next `./bin/install`.
