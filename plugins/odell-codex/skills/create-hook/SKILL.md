---
name: create-hook
description: >-
  Create Codex hooks. Use when the user wants to run a script or MCP tool at a
  Codex lifecycle event, write hooks.json, add hook scripts, or debug hook
  discovery and trust.
---

# Create Codex hooks

Create or update the hook files when the user asks for a hook. Do not stop at a format explanation.

## Choose the scope and location

Codex discovers hooks next to active configuration layers:

- User JSON: `~/.codex/hooks.json`
- User TOML: inline `[hooks]` tables in `~/.codex/config.toml`
- Project JSON: `<repo>/.codex/hooks.json`
- Project TOML: inline `[hooks]` tables in `<repo>/.codex/config.toml`
- Plugin: `hooks/hooks.json` inside the plugin unless its manifest overrides the path

Store related user scripts under `~/.codex/hooks/`. Store project scripts under `<repo>/.codex/hooks/`.

Prefer one representation per config layer. If a layer has both `hooks.json` and inline TOML hooks, Codex merges them and warns.

Project hooks load only for trusted projects. Non-managed hooks must be reviewed and trusted before they run. Use `/hooks` to inspect sources, review changes, trust a definition, or disable a hook.

## Supported lifecycle events

Use the narrowest event that fits:

- `SessionStart`, `SessionEnd`
- `UserPromptSubmit`
- `PreToolUse`, `PermissionRequest`, `PostToolUse`
- `SubagentStart`, `SubagentStop`
- `PreCompact`, `PostCompact`
- `Stop`

Event names are case-sensitive.

## JSON shape

A hook has an event, a matcher group, and one or more handlers:

```json
{
  "description": "Project command review hook.",
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "^Bash$",
        "hooks": [
          {
            "type": "command",
            "command": "/usr/bin/python3 \"$(git rev-parse --show-toplevel)/.codex/hooks/pre_tool_use.py\"",
            "timeout": 30,
            "statusMessage": "Checking shell command"
          }
        ]
      }
    ]
  }
}
```

Do not add the old Cursor `version: 1` wrapper. Keep existing unrelated hook groups intact.

## Handler types

Use one of the handler types Codex runs:

- `command` executes a local command. It receives the event JSON on stdin and returns its event-specific response on stdout.
- `mcp_tool` calls a tool on an already-connected MCP server.

`prompt` and `agent` handlers may parse, but Codex currently skips them. Do not create them.

For command hooks:

- Give scripts a valid shebang and executable permission.
- Verify every helper binary they call.
- Parse stdin defensively and emit only fields supported by that event.
- Use an explicit timeout when a stalled command would disrupt the workflow.
- Remember that matching command hooks for the same event launch concurrently.

Commands run with the session working directory. A project session may start in a subdirectory, so resolve project scripts from the Git root instead of relying on a relative path such as `.codex/hooks/script.py`.

## MCP tool example

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "mcp_tool",
            "server": "scanner",
            "tool": "scan_patch",
            "input": {
              "path": "${tool_input.file_path}"
            },
            "timeout": 30
          }
        ]
      }
    ]
  }
}
```

Codex expands `${field.nested}` placeholders from the hook event.

## Workflow

1. Determine the scope, event, matcher, handler type, and desired effect.
2. Read the existing hook source and preserve unrelated entries.
3. Write the hook definition and any required script under the matching `.codex/hooks/` directory.
4. Validate JSON or TOML syntax.
5. Make command scripts executable and verify their dependencies.
6. Open `/hooks` and complete the required trust review.
7. Trigger the real event and check the observed result.

Before using an unfamiliar event field or response field, consult the current official Codex hooks documentation.
