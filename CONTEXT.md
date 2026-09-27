# Skills repo

The source of truth for Odell skills, harness-only skills, and two frozen plugin stacks, installed into Atomic, Codex, Claude Code, and Cursor.

## Language

**Harness**:
An agent app that loads skills. There are four: Atomic, Codex, Claude Code, and Cursor.
_Avoid_: agent, IDE, tool, runtime

**Odell skill**:
A skill written here that works in any harness and is installed for all of them. It has no upstream. `setup-odell-skills` configures the repo those skills assume.
_Avoid_: global skill, shared skill, engineering skill, matt-pocock skill

**Harness skill**:
A skill written for exactly one harness. No other harness may be able to see it.
_Avoid_: adapter, port, variant, overlay

**Stack**:
A bundle of skills, agents, and automations that ships as a plugin for one harness. There are two, kept separate: **o-stack** (Cursor, set up by `setup-ostack`) and **pstack** (the Codex port, set up by `setup-pstack`). Both are frozen forks updated skill by skill.
_Avoid_: plugin stack, p-stack as a name for the Cursor plugin, ostack as a name for the Codex port

**Project skill template**:
A set of skills kept in this repo and copied into a project. After the copy, the project owns and commits its copy.
_Avoid_: linked project skill, submodule skill

**Third-party skill**:
Someone else's skill, listed by source in `third-party.json` and never stored as files here.
_Avoid_: vendor skill, dependency skill

**Built-in**:
A skill the harness ships itself. This repo never touches them.
_Avoid_: system skill, bundled skill
