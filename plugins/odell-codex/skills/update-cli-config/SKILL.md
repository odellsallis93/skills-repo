---
name: update-cli-config
description: >-
  View or modify Codex CLI and IDE-agent configuration in config.toml. Use for
  models, reasoning effort, approval policy, sandboxing, network access,
  features, MCP servers, subagent defaults, profiles, or other Codex runtime
  settings. Do not use for VS Code editor settings in settings.json.
metadata:
  surfaces:
    - cli
---

# Update Codex configuration

Codex CLI and the Codex IDE agent share TOML configuration layers.

## Locations

- User defaults: `~/.codex/config.toml`
- Project or subfolder overrides: `.codex/config.toml`
- User profiles: `~/.codex/<profile-name>.config.toml`
- System defaults on Unix: `/etc/codex/config.toml`

Codex reads trusted project layers from the repository root toward the current working directory. The closest project layer wins. CLI flags and `--config` overrides have the highest precedence.

Do not read or write the legacy Cursor JSON configuration files.

## Workflow

1. Determine whether the setting should apply to the user, one project, or one profile.
2. Read the target TOML file before editing it.
3. Check the current official Codex config reference for any key whose spelling, type, or allowed values are uncertain.
4. Change only the requested keys. Preserve comments, tables, profiles, providers, MCP servers, and unrelated settings.
5. Parse or validate the resulting TOML.
6. Explain the changed layer and whether Codex must restart or reload it.

Ask before replacing a conflicting value when the user's intended scope is unclear.

## Common keys

Top-level settings commonly include:

```toml
model = "gpt-5.6"
model_reasoning_effort = "high"
approval_policy = "on-request"
sandbox_mode = "workspace-write"
```

Related settings use tables:

```toml
[sandbox_workspace_write]
network_access = false

[features]
hooks = true

[agents]
max_concurrent_threads_per_session = 4
```

MCP servers, profiles, hooks, skills, model providers, and other features have their own tables or arrays. Do not invent a key from a plain-English label. Verify it in the current config reference.

## Boundaries

- Use the editor-settings skill for `settings.json`, themes, fonts, keybindings, and VS Code preferences.
- Do not edit cached authentication, session data, or internal state as configuration.
- Preserve the user's selected model. Do not silently substitute another model.
- Project `.codex/config.toml` files load only when the project is trusted.
- Some provider, authentication, notification, and telemetry settings are user-only and are ignored in project config.
