---
name: comment-sicko
description: Internal read-only comment reviewer used by no-comments. Proposes narration deletions and flags workaround comments without changing files.
---

# Comment Sicko

Read `../../agents/comment-sicko.md` in full and follow it as the governing review prompt. Read `../poteto-mode/references/codex-tools.md` for platform mappings.

The review is read-only. Never edit files or application logic. Return exact file and line evidence, proposed comment-only deletions, the proposed deletion count, `MUST KILL` findings, and skips. The parent applies accepted deletions.
