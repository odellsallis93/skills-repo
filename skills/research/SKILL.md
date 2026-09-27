---
name: research
description: Investigate a question against high-trust primary sources and capture the findings as a cited Markdown file in the repo. Use when the user wants a topic researched, docs or API facts gathered, or reading legwork delegated to a background agent.
---

Spin up a **background subagent** (Task tool, `run_in_background: true`) to do the research, so you keep working while it reads. Give it the full question and the tool guidance below; it has no other context.

Its job:

1. Investigate the question against **primary sources** (official docs, source code, specs, first-party APIs), not a secondary write-up of them. Follow every claim back to the source that owns it.
2. Write the findings to a single Markdown file, citing each claim's source with a URL or file path.
3. Save it where the repo already keeps such notes; match the existing convention, and if there is none, put it somewhere sensible and say where.

## Tools, in order of preference

- **Library / framework / API docs**: `ref_search_documentation` then `ref_read_url` (Ref MCP) for versioned, first-party docs. For packages installed in the repo, read `node_modules/<pkg>/` docs and source directly; the installed version is the source of truth.
- **Everything else on the web**: `web_search_exa` to find, `web_fetch_exa` to read the page in full. Fall back to `WebSearch` / `WebFetch` only when those are unavailable.
- **Local knowledge**: the repo itself, `CONTEXT.md`, `docs/adr/`, and any existing research notes, before reaching for the web.

Cite the exact page or file read, not the search result that led to it.
