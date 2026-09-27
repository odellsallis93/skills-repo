# Set up ostack

In this page you install the plugin, pick which models ostack uses, and run your first task. Setup is one command plus a short conversation.

## Install the plugin

This copy lives at `~/.cursor/plugins/local/o-stack`. Reload Cursor, then disable marketplace pstack in Customize so only this plugin's skills load.

## Pick your models

Run:

```text
/setup-ostack
```

`/setup-ostack` shows one list of what it will set up, with a recommended option, then writes. The ostack part detects the models you have access to and writes `~/.cursor/rules/ostack-models.mdc`, a small rule every ostack skill reads.

You only override what you care about. A role with no line in the rule keeps the skill's default. To restore a default, delete that role's line. A rerun of `/setup-ostack` keeps any role whose model differs from the default. A rule written before 0.15.3 pins the old default models, so delete those role lines, or delete the file, then run `/setup-ostack` again.

You might be wondering what happens if you use Auto. Set a role to `inherit-parent` or `auto` and ostack omits the subagent `model` field, so the subagent inherits your parent chat model. Both values mean the same thing, and neither is a model slug. For a panel role the value is a list, and one subagent runs per entry, so the list length sets the panel size. Setup also configures `swarm workers`, the default model for every `/swarm` worker unless a race names a model for each arm.

## Accept the verification offer, or don't

When this repo has no `verify-*` skill and no existing harness, `/setup-ostack` lists a verification skill on that same setup question. The recommended option skips it. Choose to generate one and it runs [`/create-verification-skill`](../../skills/create-verification-skill/SKILL.md).

Say yes and it writes `.cursor/skills/verify-<app>/`, a project-local skill that teaches agents to drive your app the way a user does. It proves the skill works once before handing it over. Say no and setup moves on. You can run `/create-verification-skill` yourself any time. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers when it earns its place.

After setup, start a new chat. The model rule applies to new sessions.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a colleague:

```text
/poteto-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. Its first items are the matched playbook's steps copied in, the Feature playbook for this prompt. If `/poteto-mode` skips a step, the step stays in the list with `skip: <reason>`, so you can see what it chose not to do.

From here you can type normal follow-ups. `/poteto-mode` is sticky. It stays on for the conversation until you opt out by saying so.

Next: [Route work through `/poteto-mode`](./02-poteto-mode.md).
