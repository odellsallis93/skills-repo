# Symlink each skill from the clone

`bin/install` symlinks each skill folder from this repo into the harness directories. The repo stays the source of truth, live edits apply without a second copy, and the installer never replaces a whole harness folder (built-ins and third-party skills live beside the links). It only replaces links that already point here; colliding real folders are moved to `~/.skills-backup/`.

Cursor Cloud Agents only sync `~/.cursor/skills`. Symlink sync is unproven, so Odell skills are copied there (not linked) so Cloud Agents receive real files. Re-run install after editing an Odell skill that Cursor should pick up.

**Considered Options**: copy-based sync everywhere (edits made inside a harness would drift); `npx skills add` against this repo (no Atomic support, copies instead of links, stale Codex global path).
