# C08 Repository Integration Decision v0.01

Status: **KEEP EXPERIMENTAL / DO NOT MERGE / C09 BLOCKED**

This decision applies only to the experimental branch `infra-codespaces-webmcp-poc` and the WebMCP bridge under `tools/codespace-webmcp/`.

## Decision

```text
KEEP EXPERIMENTAL
DO NOT MERGE INTO main
DO NOT OPEN AN ADOPTION PR YET
DO NOT START C09 CANONICALIZATION
```

The implementation is sufficiently coherent to preserve as an experimental branch, but the evidence required for canonical adoption is incomplete.

## Evidence supporting preservation

The branch has completed repository-side milestones C01R through C07 with a linear history from the canonical v0.10 main baseline.

Current repository-side evidence includes:

- self-identifying Codespace runtime probe implementation;
- imperative WebMCP registration for `bridge_status`;
- private-forwarded-origin transport observations;
- stable `codespace-workspace-state/v1` read contract;
- fixed verification actions `run_node_verification` and `run_lean_build`;
- deterministic `codespace-verification-action-result/v1` and per-step result contracts;
- C07 safety/authority hardening and adversarial fixture;
- no arbitrary command tool;
- no caller-supplied command, args, cwd, or source-write endpoint;
- child execution uses `execFile`, `shell: false`, fixed commands/cwd, bounded output, timeout, single-action locking, and credential-like environment stripping.

C07 supports the repository-local statements:

```text
repository safety/authority implementation: VERIFIED
local adversarial fixture: PASSED
```

## Evidence missing for adoption

The following end-to-end chain has not yet been directly observed:

```text
ChatGPT Desktop built-in browser
  -> authenticated private Codespaces forwarded page
  -> WebMCP Site Tools discovery
  -> get_workspace_state against the actual running Codespace
  -> run_node_verification in that Codespace
  -> run_lean_build in that Codespace
```

Therefore the branch does not yet support these claims:

```text
real private-port browser transport: PASSED
real ChatGPT WebMCP tool discovery: PASSED
real workspace observation through WebMCP: PASSED
real verification execution through WebMCP: PASSED
```

Repository-local smoke tests are not substitutes for those browser/runtime observations.

## Adoption gates

A future integration decision may change from `KEEP EXPERIMENTAL` to `ADOPT` only after all of the following are captured from a real GitHub Codespace checked out at this branch:

1. The bridge starts successfully on port `8787` inside GitHub Codespaces.
2. Port `8787` remains private.
3. The private `*.app.github.dev` page opens successfully in the ChatGPT Desktop built-in browser under GitHub authentication.
4. WebMCP/Site Tools discovers exactly these four tools:
   - `bridge_status`
   - `get_workspace_state`
   - `run_node_verification`
   - `run_lean_build`
5. `bridge_status` reports the expected secure, top-level forwarded origin.
6. `get_workspace_state` reports the exact repository, Codespace name, branch, HEAD, and working-tree state observed independently in the Codespace terminal.
7. `run_node_verification` returns `codespace-verification-action-result/v1` with `status = passed` for all eight fixed verifier steps.
8. `run_lean_build` returns `codespace-verification-action-result/v1` with `status = passed` for the fixed `lake build` action.
9. `node tools/codespace-webmcp/verify_safety_authority_v0_01.mjs` passes in the real branch checkout as an additional regression check.
10. The source working tree remains free of unintended changes after verification actions.

Any authentication failure, missing Site Tools discovery, origin mismatch, unexpected authority expansion, source mutation, or contract mismatch keeps the decision at `KEEP EXPERIMENTAL` until investigated.

## Current repository integration state

At the time of this C08 decision:

```text
canonical main baseline:
7f43dc1b1445e0ded12e1ea185f75230bc68cded

C07 experimental head before this decision:
181de28c56a95ca0f59070e29f7bbba5e657c1bb

branch divergence before C08 decision document:
ahead_by = 7
behind_by = 0

main impact:
none

adoption PR:
none
```

The pre-C08 branch diff relative to `main` consisted only of files under:

```text
tools/codespace-webmcp/
```

No visualizer runtime source, Lean theorem, formal dependency pin, GitHub Actions workflow, or canonical main documentation was modified by C01R-C07.

## C09 gate

C09 is optional canonicalization, not an automatic next step.

```text
C09 status: BLOCKED
```

C09 may begin only after the real end-to-end adoption gates above pass and a new integration decision explicitly changes the disposition to `ADOPT`.

Until then, the branch should remain isolated and preserved as a research/engineering POC.

## Result

```text
C08 REPOSITORY INTEGRATION DECISION: PASSED
DISPOSITION: KEEP EXPERIMENTAL
MAIN: UNCHANGED
ADOPTION PR: NOT OPENED
C09: BLOCKED PENDING REAL END-TO-END RUNTIME EVIDENCE
```
