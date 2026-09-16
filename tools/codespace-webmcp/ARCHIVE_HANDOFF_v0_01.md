# WebMCP Codespace Bridge — Archive Handoff v0.01

Archived: 2026-09-17

Status: **FROZEN / KEEP EXPERIMENTAL / DO NOT MERGE**

This document records the post-C08 state of the experimental WebMCP-to-GitHub-Codespaces bridge. It is a resumable archive, not a canonical visualizer milestone.

## Scope and branch

```text
repository: Akari-H-111/self-similar-calabi-yau-visualizer
experimental branch: infra-codespaces-webmcp-poc
canonical main baseline: 7f43dc1b1445e0ded12e1ea185f75230bc68cded
pre-archive experimental HEAD: ade8fb3c01cfb8b95d1698b9f5ec90dfa725b13e
pre-archive divergence: ahead_by = 8, behind_by = 0
main impact: none
adoption PR: none
```

Before this archive commit, every branch-only file is under `tools/codespace-webmcp/`.

The historical C08 decision remains authoritative for the original adoption gate:

```text
KEEP EXPERIMENTAL
DO NOT MERGE INTO main
DO NOT OPEN AN ADOPTION PR YET
```

This archive does not rewrite C08. It records additional runtime evidence obtained afterwards and the reason the experiment is being paused.

## Implemented bridge surface

The browser page declares exactly four WebMCP tools:

1. `bridge_status`
2. `get_workspace_state`
3. `run_node_verification`
4. `run_lean_build`

The server exposes only two executable verification actions:

- `run_node_verification` -> eight fixed canonical Node verifier scripts;
- `run_lean_build` -> fixed `lake build` in `formal/`.

The C07 authority boundary remains unchanged:

- no arbitrary `run_command`;
- no caller-supplied command, args, or cwd;
- no source-write endpoint;
- `execFile` with `shell: false`;
- fixed working directories and argument arrays;
- bounded output and execution timeout;
- single-action locking;
- credential-like child environment variables stripped before spawning.

`SAFETY_AUTHORITY_AUDIT_v0_01.md` and `verify_safety_authority_v0_01.mjs` remain the repository-side safety evidence.

## Latest evidence matrix

Evidence classes are intentionally separated. Repository-local verification is not treated as a substitute for browser/runtime observation.

| Gate | Status | Evidence class | Notes |
|---|---|---|---|
| Repository implementation C01R-C08 | PASS | repository | Linear experimental branch preserved. |
| C07 safety/authority audit | PASS | repository/local fixture | Fixed authority surface and adversarial fixture passed. |
| Bridge startup in real GitHub Codespace | PASS | user-observed runtime | Bridge served the forwarded page from port 8787. |
| Private forwarded page opens in ChatGPT Desktop built-in browser | PASS | user-observed runtime | Authenticated `*.app.github.dev` page was opened successfully. |
| WebMCP Site Tools discovery | PASS | user-observed runtime | Exactly four tools appeared: Codespace Bridge Status, Get Codespace Workspace State, Run Node Verification, Run Lean Build. |
| Site Tools read/write classification | PASS | user-observed UI | UI showed two read tools and two non-read-only action tools, matching annotations. |
| `bridge_status` invoked through Site Tools | PENDING | end-to-end | Not captured before the experiment was paused. |
| `get_workspace_state` invoked through Site Tools | PENDING | end-to-end | Exact repository / Codespace / branch / HEAD / clean-tree response not yet captured through WebMCP invocation. |
| `run_node_verification` invoked through Site Tools | PENDING | end-to-end | Expected result remains 8/8 fixed verifier steps passed. |
| `run_lean_build` invoked through Site Tools | PENDING | end-to-end | Expected result remains 1/1 fixed `lake build` step passed. |
| Source tree remains clean after WebMCP actions | PENDING | end-to-end | Must be checked after the two action invocations. |
| Ordinary ChatGPT web conversation directly invokes private Codespace Site Tools | NOT PURSUED | product-surface boundary | Current web-chat surface does not inherit the Desktop built-in browser page's private Site Tools context. |

## Why the branch is frozen now

The remaining work is no longer repository engineering. The bridge implementation and Site Tools discovery have already crossed the main architectural proof-of-concept threshold.

The unfinished gates require the ChatGPT Desktop built-in browser Site Tools execution context. At the time of archival, the relevant Site Tools usage quota/capacity was exhausted, and continuing to optimize for ordinary ChatGPT web-chat direct access would distract from the visualizer's canonical roadmap.

Therefore:

```text
implementation disposition: preserve
integration disposition: KEEP EXPERIMENTAL
canonicalization disposition: do not merge
work status: frozen, resumable
main project: resume Self-Similar Calabi–Yau Visualizer work
```

This is a pause, not a negative finding about the bridge architecture.

## Resume checklist

If this experiment is resumed, do not redesign the bridge first. Start from the preserved branch and execute the remaining end-to-end gates in this order:

1. Check out `infra-codespaces-webmcp-poc` in a real GitHub Codespace.
2. Run `node tools/codespace-webmcp/verify_safety_authority_v0_01.mjs` and require PASS.
3. Start `node tools/codespace-webmcp/server.mjs`.
4. Keep forwarded port `8787` private.
5. Open the private forwarded URL in the ChatGPT Desktop built-in browser while authenticated to GitHub.
6. Confirm exact discovery of the same four Site Tools and no additional authority.
7. Invoke `Codespace Bridge Status`; require Codespaces runtime plus secure, top-level, expected-origin transport checks to pass.
8. Invoke `Get Codespace Workspace State`; independently compare repository, Codespace name, branch, HEAD, and working-tree state against the Codespace terminal.
9. Invoke `Run Node Verification`; require `expectedStepCount = 8`, `passedStepCount = 8`, `failedStepCount = 0`, `status = passed`.
10. Invoke `Run Lean Build`; require `expectedStepCount = 1`, `passedStepCount = 1`, `failedStepCount = 0`, `status = passed`.
11. Run `git status --short` in the Codespace terminal and require no unintended source changes.
12. Only after all gates pass, revisit C08 and decide whether an explicit `ADOPT` decision and C09 canonicalization are justified.

Do not broaden the tool into arbitrary terminal access merely to complete the smoke test.

## Deferred / optional work

The following are explicitly deferred and are not blockers for the Self-Similar Calabi–Yau Visualizer mainline:

- ordinary ChatGPT web-chat direct access to private Codespace runtime;
- arbitrary command execution;
- source-write authority;
- automatic adoption into `main`;
- C09 canonicalization;
- custom MCP + SSH fallback implementation.

The SSH/MCP route remains a fallback architecture only if future product constraints make the Desktop WebMCP route unsuitable.

## Handoff summary

```text
Repository safety/authority implementation   PASS
Private Codespace forwarded page             PASS
Desktop WebMCP exact discovery (4 tools)      PASS
End-to-end tool invocation                    INCOMPLETE
Web-chat direct Codespace access              NOT PURSUED
Decision                                      KEEP EXPERIMENTAL
Branch                                        PRESERVE
Main                                          UNCHANGED
Next canonical project work                   return to visualizer roadmap
```

The next person/thread should treat this file, `REPOSITORY_INTEGRATION_DECISION_v0_01.md`, and `SAFETY_AUTHORITY_AUDIT_v0_01.md` as the minimum recovery set for the WebMCP branch.