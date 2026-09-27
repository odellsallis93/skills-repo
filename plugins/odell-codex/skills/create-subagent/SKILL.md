---
name: create-subagent
description: >-
  Create custom Codex subagents for specialized tasks. Use when the user wants
  a reusable reviewer, debugger, researcher, worker, or other custom agent with
  its own model, sandbox, tools, or instructions.
---

# Create custom Codex subagents

Create a reusable custom agent as a standalone TOML configuration file. Infer the job and scope from the conversation when the answer is clear. Ask only when the missing choice would materially change the agent.

## Choose the scope

| Location | Scope |
|---|---|
| `<repo>/.codex/agents/<name>.toml` | One trusted project |
| `~/.codex/agents/<name>.toml` | All local projects for this user |

Prefer the project location for repository-specific knowledge or team-shared behavior. Prefer the user location for personal agents that should work in unrelated repositories.

Project agent files load only when Codex trusts the project. If a project and user agent share the same `name`, the project configuration layer takes precedence.

## File format

Every custom agent file must define `name`, `description`, and `developer_instructions`.

```toml
name = "code_reviewer"
description = "Review changed code for correctness, security, regressions, and missing tests."
sandbox_mode = "read-only"

developer_instructions = """
Review the current changes like a code owner.
Lead with concrete findings and cite the affected files.
Ignore style-only comments unless they hide a real defect.
Do not edit files unless the parent agent explicitly asks for a fix.
"""
```

Use a simple snake_case `name`. Match the filename to the name when practical. The `name` field remains the source of truth.

## Optional settings

A custom agent file is a Codex configuration layer. Add only settings needed for that role:

- `model` and `model_reasoning_effort`
- `sandbox_mode`
- `mcp_servers`
- `skills.config`

Do not copy the full user configuration into each agent. Unspecified values inherit from the parent session.

## Workflow

1. Decide the agent's one job and whether it is project-scoped or user-scoped.
2. Check for an existing file or agent with the same name. Preserve unrelated content and never overwrite silently.
3. Create the `.codex/agents` directory only when it is missing.
4. Write a TOML file with the three required fields.
5. Add model, reasoning, sandbox, MCP, or skill settings only when the job requires them.
6. Parse or inspect the TOML for syntax errors.
7. Test the agent with a small realistic task. Restart Codex if a new definition is not discovered in the current session.

## Quality rules

- Keep each agent focused on one kind of work.
- Describe when the parent should choose it in concrete terms.
- Put durable role behavior in `developer_instructions`.
- Set a read-only sandbox for review and research roles unless they must edit.
- Preserve the user's model choice and authorization limits.

For current schema details, consult the official Codex subagents documentation before using an unfamiliar configuration key.
