import { describe, expect, it } from "bun:test";
import {
  ChecksUnavailable,
  WatcherQueryError,
  collectOpenPullRequests,
  collectReviewThreads,
  mapRollupNode,
  orderStack,
  parsePullRequest,
  parseReviewThreads,
  runCommand,
  resolveChecks,
  resolveContext,
} from "./github.ts";
import {
  fakeReader,
  failedCheck,
  passingCheck,
  pendingCheck,
} from "./fakes.test-helper.ts";
import { parsePrNumber } from "./types.ts";

const context = {
  owner: "owner",
  repo: "repo",
  number: parsePrNumber(42),
};

describe("checks fallback chain", () => {
  it("bounds a subprocess that never exits", async () => {
    await expect(
      runCommand(
        [process.execPath, "-e", "setInterval(() => {}, 1_000)"],
        50
      )
    ).rejects.toMatchObject({
      failure: { kind: "command-timeout", retryable: true },
    });
  });

  it("waits for kill escalation when a child ignores SIGTERM", async () => {
    const started = performance.now();
    await expect(
      runCommand(
        [
          "/bin/sh",
          "-c",
          "trap '' TERM; while :; do sleep 1; done",
        ],
        100,
        60
      )
    ).rejects.toMatchObject({ failure: { kind: "command-timeout" } });
    expect(performance.now() - started).toBeGreaterThanOrEqual(150);
  });

  it("reports a missing command as a structured query failure", async () => {
    await expect(
      runCommand(["pstack-command-that-does-not-exist"])
    ).rejects.toMatchObject({
      failure: { kind: "command-spawn", retryable: true },
    });
  });

  it("uses a non-empty fast-path result without a rollup query", async () => {
    const reader = fakeReader({
      fastPath: { kind: "checks", checks: [passingCheck("fast")] },
    });
    const read = await resolveChecks(reader, context);
    expect(read.source).toBe("gh-pr-checks");
    expect(read.checks.map((check) => check.name)).toEqual(["fast"]);
    expect(reader.calls).toEqual(["checksFastPath"]);
  });

  it("paginates GraphQL when the fast path is unusable", async () => {
    const reader = fakeReader({
      fastPath: { kind: "unusable", exitCode: 8, stderr: "" },
      rollupPages: [
        { checks: [passingCheck("first")], endCursor: "next" },
        { checks: [failedCheck("second")], endCursor: null },
      ],
    });
    const read = await resolveChecks(reader, context);
    expect(read.source).toBe("graphql-rollup");
    expect(read.checks.map((check) => check.name)).toEqual(["first", "second"]);
    expect(reader.calls).toEqual([
      "checksFastPath",
      "checkRollupPage:null",
      "checkRollupPage:next",
    ]);
  });

  it("falls back when valid fast-path JSON represented an empty list", async () => {
    const reader = fakeReader({
      fastPath: { kind: "checks", checks: [] },
      rollupPages: [{ checks: [pendingCheck("fallback")], endCursor: null }],
    });
    expect((await resolveChecks(reader, context)).checks[0].name).toBe(
      "fallback"
    );
    expect(reader.calls).toEqual(["checksFastPath", "checkRollupPage:null"]);
  });

  it("fails closed when both paths are empty", async () => {
    const reader = fakeReader({
      fastPath: {
        kind: "unusable",
        exitCode: 8,
        stderr: "credential cannot read checks",
      },
    });
    await expect(resolveChecks(reader, context)).rejects.toBeInstanceOf(
      ChecksUnavailable
    );
    expect(reader.calls).toEqual(["checksFastPath", "checkRollupPage:null"]);
  });
});

describe("rollup node mapping", () => {
  it("maps terminal and non-terminal CheckRun states fail closed", () => {
    const cases = [
      ["IN_PROGRESS", null, "pending", "PENDING"],
      ["COMPLETED", "SUCCESS", "passed", "SUCCESS"],
      ["COMPLETED", "NEUTRAL", "skipped", "NEUTRAL"],
      ["COMPLETED", "SKIPPED", "skipped", "SKIPPED"],
      ["COMPLETED", "ACTION_REQUIRED", "failed", "ACTION_REQUIRED"],
      ["COMPLETED", "TIMED_OUT", "failed", "FAILURE"],
      ["COMPLETED", "FUTURE_VALUE", "failed", "FAILURE"],
    ] as const;
    for (const [status, conclusion, kind, reportedState] of cases) {
      expect(
        mapRollupNode({
          __typename: "CheckRun",
          name: "ci",
          status,
          conclusion,
        })
      ).toMatchObject({ kind, reportedState });
    }
  });

  it("classifies an in-progress Code Review Gate from the rollup as the gate", () => {
    expect(
      mapRollupNode({
        __typename: "CheckRun",
        name: "Code Review Gate",
        status: "IN_PROGRESS",
        conclusion: null,
      })
    ).toMatchObject({ kind: "code-review-gate" });
    expect(
      mapRollupNode({
        __typename: "StatusContext",
        context: "Code Review Gate",
        state: "PENDING",
      })
    ).toMatchObject({ kind: "code-review-gate" });
  });

  it("maps StatusContext states and drops unknown typenames", () => {
    expect(
      mapRollupNode({
        __typename: "StatusContext",
        context: "ci",
        state: "EXPECTED",
      })
    ).toMatchObject({ kind: "pending", reportedState: "PENDING" });
    expect(
      mapRollupNode({
        __typename: "StatusContext",
        context: "ci",
        state: "FUTURE_VALUE",
      })
    ).toMatchObject({ kind: "failed", reportedState: "FUTURE_VALUE" });
    expect(mapRollupNode({ __typename: "FutureNode" })).toBeNull();
  });
});

describe("closed enum parsing", () => {
  const rawPullRequest = {
    mergeable: "MERGEABLE",
    mergeStateStatus: "CLEAN",
    reviewDecision: "APPROVED",
    headRefOid: "head",
    headRefName: "feature",
    baseRefName: "main",
    state: "OPEN",
    mergedAt: null,
    isDraft: false,
  };

  it("accepts mergeStateStatus CONFLICTING", () => {
    expect(
      parsePullRequest(
        { ...rawPullRequest, mergeStateStatus: "CONFLICTING" },
        context
      ).mergeStateStatus
    ).toBe("CONFLICTING");
  });

  it("reads gh's empty reviewDecision as no decision rather than a parse failure", () => {
    expect(
      parsePullRequest({ ...rawPullRequest, reviewDecision: "" }, context)
        .reviewDecision
    ).toBeNull();
  });

  it("still rejects an unknown reviewDecision", () => {
    expect(() =>
      parsePullRequest({ ...rawPullRequest, reviewDecision: "MAYBE" }, context)
    ).toThrow(WatcherQueryError);
  });

  it("rejects unknown enum values as retryable errors carrying the raw value", () => {
    try {
      parsePullRequest(
        { ...rawPullRequest, mergeStateStatus: "FUTURE_STATE" },
        context
      );
      throw new Error("expected parser to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(WatcherQueryError);
      if (!(error instanceof WatcherQueryError)) throw error;
      expect(error.failure).toMatchObject({
        kind: "missing-key",
        retryable: true,
        rawValue: '"FUTURE_STATE"',
      });
    }
  });
});

it("annotates Bugbot threads with distinct review-pass counts", () => {
  const response = {
    data: {
      repository: {
        pullRequest: {
          reviewThreads: {
            nodes: [
              {
                id: "one",
                isResolved: false,
                comments: {
                  nodes: [
                    {
                      body: "RUN_ID: run-1",
                      createdAt: "now",
                      path: "a.ts",
                      line: 1,
                      author: { login: "bugbot" },
                    },
                  ],
                },
              },
              {
                id: "two",
                isResolved: false,
                comments: {
                  nodes: [
                    {
                      body: "CURSOR_AUTOMATION_ID: run-2 severity high",
                      createdAt: "now",
                      path: null,
                      line: null,
                      author: { login: "cursor" },
                    },
                  ],
                },
              },
              {
                id: "resolved",
                isResolved: true,
                comments: {
                  nodes: [
                    {
                      body: "RUN_ID: run-3",
                      createdAt: "now",
                      path: null,
                      line: null,
                      author: { login: "bugbot" },
                    },
                  ],
                },
              },
            ],
          },
        },
      },
    },
  };
  const threads = parseReviewThreads(response);
  expect(threads).toHaveLength(2);
  expect(threads.map((thread) => thread.isBugbot)).toEqual([true, true]);
  expect(threads.map((thread) => thread.bugbotReviewPasses)).toEqual([3, 3]);
});

describe("context and stack discovery", () => {
  it("paginates open pull requests instead of truncating stack discovery", async () => {
    const after: Array<string | null> = [];
    const prs = await collectOpenPullRequests(async (cursor) => {
      after.push(cursor);
      const number = cursor === null ? 41 : 42;
      return {
        data: {
          repository: {
            pullRequests: {
              nodes: [
                {
                  number,
                  headRefName: `feature-${number}`,
                  baseRefName: number === 41 ? "main" : "feature-41",
                  isCrossRepository: false,
                },
              ],
              pageInfo: {
                hasNextPage: cursor === null,
                endCursor: cursor === null ? "page-2" : null,
              },
            },
          },
        },
      };
    });
    expect(after).toEqual([null, "page-2"]);
    expect(prs.map((pr) => Number(pr.number))).toEqual([41, 42]);
  });

  it("paginates review threads so a page-two blocker cannot be missed", async () => {
    const after: Array<string | null> = [];
    const threads = await collectReviewThreads(async (cursor) => {
      after.push(cursor);
      return {
        data: {
          repository: {
            pullRequest: {
              reviewThreads: {
                nodes:
                  cursor === null
                    ? []
                    : [
                        {
                          id: "page-two-thread",
                          isResolved: false,
                          comments: { nodes: [] },
                        },
                      ],
                pageInfo: {
                  hasNextPage: cursor === null,
                  endCursor: cursor === null ? "page-2" : null,
                },
              },
            },
          },
        },
      };
    });
    expect(after).toEqual([null, "page-2"]);
    expect(threads.map((thread) => thread.id)).toEqual(["page-two-thread"]);
  });

  it("returns a fully explicit context without any reader call", async () => {
    const reader = fakeReader();
    expect(
      await resolveContext({
        reader,
        owner: "explicit",
        repo: "repo",
        pr: context.number,
      })
    ).toEqual({ owner: "explicit", repo: "repo", number: context.number });
    expect(reader.calls).toEqual([]);
  });

  it("uses the local origin before currentPr for an explicit number", async () => {
    const reader = fakeReader({ origin: { owner: "local", repo: "checkout" } });
    expect(
      await resolveContext({
        reader,
        owner: null,
        repo: null,
        pr: context.number,
      })
    ).toEqual({ owner: "local", repo: "checkout", number: context.number });
    expect(reader.calls).toEqual(["originRepo"]);
  });

  it("orders the connected stack bottom-to-top", () => {
    const ordered = orderStack(context, [
      {
        number: parsePrNumber(41),
        headRefName: "base-feature",
        baseRefName: "main",
        isCrossRepository: false,
      },
      {
        number: context.number,
        headRefName: "feature",
        baseRefName: "base-feature",
        isCrossRepository: false,
      },
      {
        number: parsePrNumber(43),
        headRefName: "upstack",
        baseRefName: "feature",
        isCrossRepository: false,
      },
    ]);
    expect(ordered.map((item) => Number(item.number))).toEqual([41, 42, 43]);
  });

  it("fails closed on a cyclic branch topology", () => {
    expect(() =>
      orderStack(context, [
        {
          number: context.number,
          headRefName: "feature-a",
          baseRefName: "feature-b",
          isCrossRepository: false,
        },
        {
          number: parsePrNumber(43),
          headRefName: "feature-b",
          baseRefName: "feature-a",
          isCrossRepository: false,
        },
      ])
    ).toThrow(WatcherQueryError);
  });

  it("does not connect or reject unrelated fork branches with reused names", () => {
    const ordered = orderStack(context, [
      {
        number: context.number,
        headRefName: "feature",
        baseRefName: "main",
        isCrossRepository: false,
      },
      {
        number: parsePrNumber(43),
        headRefName: "feature",
        baseRefName: "other-base",
        isCrossRepository: true,
      },
    ]);
    expect(ordered.map((item) => Number(item.number))).toEqual([42]);
  });

  it("fails closed instead of flattening sibling PRs into a linear stack", () => {
    expect(() =>
      orderStack(context, [
        {
          number: context.number,
          headRefName: "base-feature",
          baseRefName: "main",
          isCrossRepository: false,
        },
        {
          number: parsePrNumber(43),
          headRefName: "child-a",
          baseRefName: "base-feature",
          isCrossRepository: false,
        },
        {
          number: parsePrNumber(44),
          headRefName: "child-b",
          baseRefName: "base-feature",
          isCrossRepository: false,
        },
      ])
    ).toThrow(WatcherQueryError);
  });
});
