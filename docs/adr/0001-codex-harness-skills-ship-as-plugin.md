# Codex harness skills ship as a plugin

Cursor also loads `~/.agents/skills` and `~/.claude/skills`, and there is no user-level folder only Codex reads. Codex-only skills therefore ship as the `odell-codex` plugin so Cursor cannot pick them up. Cursor-only skills go in `~/.cursor/skills`; Atomic-only skills go in `~/.atomic/agent/skills`. There are no Claude-only skills.

**Considered Options**: a Claude/Codex-only folder (Cursor would still load it); plugins for every harness (unnecessary where a private folder exists).
