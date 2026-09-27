# pstack for Codex

This is a Codex-native adaptation of Cursor's official pstack plugin, synced to upstream version 0.14.5.

pstack is a set of rigorous engineering workflows. Its main entry point is `pstack:poteto-mode`. It selects a playbook, applies the relevant engineering principles, delegates deliberately, and requires evidence before declaring work complete.

## Start here

1. Invoke `pstack:setup-pstack` to configure models for each role.
2. Invoke `pstack:poteto-mode` for any task that benefits from rigor.

Useful direct entry points include `pstack:architect`, `pstack:arena`, `pstack:swarm`, `pstack:interrogate`, `pstack:tdd`, `pstack:no-comments`, `pstack:technical-writing`, and `pstack:make-bot-ui`.

## Codex adaptation

The upstream skill, playbook, guide, agent, and script set is retained except where Cursor-only mechanics require a Codex adaptation. Every adapted workflow points to `skills/poteto-mode/references/codex-tools.md`. That mapping covers Codex subagents, model selection, task plans, task history, GitHub access, browser and desktop verification, loops, automations, authorization, and instruction files.

Two upstream subagents are exposed as internal Codex skills:

- `pstack:poteto-agent` routes a delegated worker through the complete poteto-mode style.
- `pstack:comment-sicko` performs the read-only comment review used by `pstack:no-comments`.

Cursor's sticky mode and plugin hook runtime do not have direct Codex plugin equivalents. Poteto mode remains explicit unless the user opts into a global routing rule in `~/.codex/AGENTS.md`.

The `make-bot-ui` workflow uses webhook-triggered Codex Automations. It keeps secrets outside chat and the project, binds applications to loopback, and requires explicit approval for software installation, tailnet exposure, and automation changes.

Bundled scripts do not install dependencies or refresh network state implicitly. The orchestration and watcher entry points fail closed until their locked production dependency is installed explicitly. The worktree audit is local-only unless `--refresh` is supplied.

P-stack invokes `deslop` before commits but does not include it in the official P-stack tree. This port bundles only that required Cursor Team Kit dependency. It does not bundle unrelated Team Kit workflows.


See `PORTING.md` for the adaptation boundary and known differences.
