---
name: swarm
description: Fan out N parallel workers, drain them, and return one report. Use for swarm, parallel coverage, races, gauntlets, and exploration.
---

# Swarm

Read `../poteto-mode/references/codex-tools.md` before spawning workers.

Fan out N parallel Codex subagents. They may cover separate slices, race the same brief, or mix both. The parent waits, aggregates, and returns one report.

## Start

Open a task plan with one entry per phase.

1. Frame.
2. Fan out.
3. Aggregate.
4. Report.

## Phase A. Frame

1. State the done predicate and the artifact or report the swarm must return.
2. Choose the shape. Partition into slices, race N workers on identical briefs, or mix both. For a race or mixed shape, declare `first pass`, `rank all`, or `best-of` before spawning.
3. Set N from the user or derive it from the shape. N is total workers, not the live concurrency limit.
4. Read `swarm workers` from `~/.codex/pstack-models.md` when present. Otherwise use `gpt-5.6-luna/max`. For a model race, name each arm's model and reasoning effort first.
5. Give each writer a separate file set, branch, worktree, or output directory.

## Phase B. Fan out

Spawn as many workers concurrently as the current Codex limit permits. Use rolling waves when N exceeds available slots. A worker needing a model override receives a bounded or empty history fork as required by Codex.

Every brief stands alone. Include the goal, scope, exact slice or race arm, write boundary, verification method, and report format. Reports use `PASS`, `ISSUES`, or `BLOCKED` with evidence.

If a worker drops out, proceed with N minus one and note the gap.

## Phase C. Aggregate

Wait for results with `wait_agent`. For coverage, every required slice needs a result. For a race, apply the declared selection rule. Do not paste raw worker dumps.

Keep a compact result list, one-line evidenced issues, and explicit gaps or dropouts.

## Phase D. Report

Return one consolidated report with the result list, evidenced issues, gaps, and the race rule when used.
