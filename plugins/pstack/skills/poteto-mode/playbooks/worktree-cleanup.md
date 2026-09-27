### Worktree and simulator cleanup

**You own the disk and the safety gate.** Prune merged or abandoned git worktrees and stale iOS simulators to reclaim space. Deletion is irreversible, so every step guards against deleting something in use or holding uncommitted work.

1. Snapshot and audit. Record `df -h /`, then run `scripts/worktree-audit.sh` (principle-build-the-lever). It reads paths from `git worktree list`, never hand-typed, since worktrees may live under a Codex-managed directory or another repository-specific root. It classifies each worktree by size, age, merge state, uncommitted work, and PR state, then suggests a verification bucket.
2. The bucket is advice, not permission. Pinned and active Codex tasks are the real artifact (principle-prove-it-works). Use `list_threads` and exact `read_thread` calls to cross-check every candidate. A pinned or active task wins over the script's suggestion.
3. Verify usage before deleting. For every `verify-task-use` row, or anything you doubt, fan subagents out over exact task IDs and report whether the task is pinned or ongoing and which worktrees it touches. Never sweep unrelated task history.
4. Pause on irreversible loss. `wip:N` is N tracked uncommitted edits. Show the diff and get a decision first, since removing a clean worktree is recoverable from its branch but uncommitted work is gone. `scratch:N` is untracked throwaway, safe to drop, but name the files. Per Autonomy, clean and merged and not-in-use proceeds; `wip` and in-use pause.
5. Show the exact confirmed paths and ask for action-time approval before removal. Prefer the platform trash when practical. If the user approves permanent removal, run `git worktree remove <path>` first and add `--force` only for the specifically approved dirty or scratch case. Run `git worktree prune` afterward. Confirm with `df -h /` and re-list.
6. Simulators and other reclaimers. Treat each as a separate destructive target and request approval for the exact set. Candidates include unavailable simulators, old Xcode DerivedData, device support, Codex app caches, and package caches. Never broaden a worktree-cleanup request into cache deletion without explicit scope.

This is the one playbook that deletes user state with no code review to catch a slip, so the gates above are the review.

**Reply:** `df -h /` before and after with space reclaimed, the worktrees pruned, and a one-line reason for each held back (in-use by which chat, or uncommitted work).
