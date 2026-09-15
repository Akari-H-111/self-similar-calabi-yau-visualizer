# GitHub CI Formal Verification Seal — v0.06

## Milestone

**Thread F06 — GitHub CI Integration & Formal Verification Seal**

Status: **passed / sealed**

Date: 2026-09-16

Canonical F05 parent:

```text
26f3e8818a5b96bc8cebf4edf72d43c124543832
formal: seal F05 contract bridge audit
```

Verified CI implementation candidate:

```text
66ad46f520ff80c04673c375c7801723ba0b9aed
ci: integrate sealed formal and runtime verification
```

Working branch:

```text
formal-f06-github-ci-seal
```

Workflow:

```text
.github/workflows/formal-verification.yml
```

## Goal and result

F06 integrates the already sealed Lean formal core and the existing Node engineering verifiers into GitHub Actions without enlarging either semantic scope.

The workflow contains two independent jobs:

```text
formal-lean
runtime-contracts
```

This separation is intentional:

```text
Lean failure != runtime failure
runtime pass != mathematical theorem
```

The workflow runs on pushes to `main` and the F06 branch, on pull requests, and by `workflow_dispatch`.

## Pinned formal environment

The workflow respects the repository dependency lock and does not run `elan default stable` or `lake update`.

Canonical pins remain:

```text
Lean:    leanprover/lean4:v4.34.0
Lake:    5.0.0-src+293d5d0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

The successful candidate run observed:

```text
Lean 4.34.0, commit 293d5d0c0c3f3dded4688b3ccd6a33939ac5102b
Lake 5.0.0-src+293d5d0
mathlib checkout 7801e8406155c31b340d28e2762f754d02b5e9b0
```

## Mandatory GitHub Actions evidence

The first real candidate workflow run is:

```text
run ID:   35003906913
head SHA: 66ad46f520ff80c04673c375c7801723ba0b9aed
event:    push
status:   completed
result:   success
```

### `formal-lean`

Job ID:

```text
104498766094
```

Result:

```text
success
```

The job successfully executed the repository-pinned environment setup, pin checks, mathlib cache retrieval, and:

```bash
lake build
lake env lean SelfSimilarCY/CoordinatePower.lean
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
lake env lean SelfSimilarCY/PullbackTower.lean
```

Observed build result:

```text
Build completed successfully (8929 jobs).
```

The direct module compilations completed without Lean diagnostics.

The source-limited placeholder gate also passed:

```text
Lean placeholder gate: passed
```

The scan is restricted to `formal/SelfSimilarCY/*.lean` descendants and rejects `axiom`, `sorry`, or `admit` rather than masking matches.

### `runtime-contracts`

Job ID:

```text
104498766196
```

Result:

```text
success
```

The job requests Node.js major version `22`; the successful candidate run resolved:

```text
Node v22.23.2
```

All four canonical runtime verifiers passed:

```text
scene-spec v0.03 verification: passed
base-renderer v0.04 verification: passed
one-step pullback v0.05 verification: passed
recursive lazy expansion v0.06 verification: passed
```

The five existing JavaScript syntax checks also passed.

## F05 bridge boundary preservation

F06 does not revise the F05 bridge matrix. The matrix remains byte-for-byte unchanged from F05, with blob SHA:

```text
0fc903f7c3892b83665ec28cee5c5f588ec77aff
```

Its classification statistics remain:

```text
EXACT_BRIDGE:      4
PARTIAL_BRIDGE:    3
ENGINEERING_ONLY:  5
FORMAL_ONLY:       3
UNFORMALIZED:      3
NO_BRIDGE:         4
```

The machine-readable matrix retains historical staging-era `sealStatus` metadata at its tail. F06 deliberately does not rewrite that historical artifact. Final F05 seal authority remains the canonical F05 state, audit, and progress artifacts, all of which record F05 as passed / sealed after fresh executable evidence. The classification rows and statistics are unchanged.

## Semantic meaning of a green CI run

A successful F06 workflow means only:

```text
Engineering verification: passed
Formal Lean verification: passed
Contract-bridge boundary: preserved and audited by F05
```

Equivalently:

\[
\boxed{
\begin{aligned}
&\text{the sealed Lean formal core is continuously verified;}\\
&\text{the runtime engineering contracts are continuously verified;}\\
&\text{their bridge boundary remains the audited F05 boundary.}
\end{aligned}}
\]

It does **not** mean that all visualizer mathematics is formally verified.

In particular, F06 does not formalize or verify:

- `W`, `W = 0`, or `X = W^{-1}(lambda)` as a Lean hypersurface;
- Calabi–Yau geometry, smoothness, or singularities;
- `deg(P_D)=D^4` as a mathematical map-degree theorem;
- concrete `D^4` sheets, coverings, étale structure, or torus restrictions;
- Jacobians or differentials;
- `P_D^* g_log = D^2 g_log`;
- browser-engine rendering correctness, Three.js, WebGL, or UI correctness.

The F05 categories `UNFORMALIZED`, `NO_BRIDGE`, `ENGINEERING_ONLY`, `FORMAL_ONLY`, and `PARTIAL_BRIDGE` remain in force.

## Scope and changed files

F06 introduces no Lean theorem source change, no runtime semantic JavaScript change, no `data/system.json` change, no mathlib/Lake dependency change, and no F05 matrix change.

The complete F06 seal relative to the sealed F05 parent is limited to:

```text
.github/workflows/formal-verification.yml
docs/GITHUB_CI_FORMAL_VERIFICATION_SEAL_self_similar_cy_visualizer_v0_06.md
docs/state_formal_verification_self_similar_cy_visualizer_v0_06.json
docs/progress_formal_verification_self_similar_cy_visualizer_v0_06.md
```

No README update is required for this milestone because the dedicated F06 canonical artifacts state the CI scope precisely without retroactively changing runtime-version documentation.

## Local execution note

The current assistant execution surface does not expose a direct shell checkout of this private repository, so no separate local terminal run is counted as F06 evidence. The mandatory GitHub Actions candidate run executed the exact required Lean and Node commands on the candidate commit and is the new F06 evidence required by this milestone.

## Final decision

All mandatory F06 gates are satisfied on the candidate lineage:

```text
exact F05 parent                         passed
clean F06 branch ancestry                passed
repository-pinned Lean/mathlib           passed
lake build                               passed
three direct Lean module checks          passed
placeholder gate                         passed
four Node verifiers                      passed
actual GitHub Actions formal-lean        passed
actual GitHub Actions runtime-contracts  passed
F05 bridge classifications unchanged     passed
scope compare                            passed
forbidden scope expansion absent         passed
```

Therefore:

```text
F06 GITHUB CI INTEGRATION & FORMAL VERIFICATION SEAL:
PASSED / SEALED
```

F06 stops here. No new theorem, `W`, degree, metric, sheet, covering, étale, torus, Jacobian, differential, or later formalization milestone is started by this seal.
