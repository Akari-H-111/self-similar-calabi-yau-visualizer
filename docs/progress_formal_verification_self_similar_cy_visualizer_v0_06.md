# Formal Verification Progress — v0.06

## Milestone

**Thread F06 — GitHub CI Integration & Formal Verification Seal**

Status: **passed / sealed**

Date: 2026-09-16

Canonical F05 parent:

```text
26f3e8818a5b96bc8cebf4edf72d43c124543832
formal: seal F05 contract bridge audit
```

F06 branch:

```text
formal-f06-github-ci-seal
```

CI implementation commit:

```text
66ad46f520ff80c04673c375c7801723ba0b9aed
ci: integrate sealed formal and runtime verification
```

## Gate 0 — canonical F05 seal

Before implementation, canonical `main` was exact-read and confirmed at the expected F05 sealing commit. The F05 state recorded:

```text
status = passed
canonicalState = sealed
sealCondition = satisfied
verifiedCandidateCommit = cbb03ba1570ca2ad226024d59fc4ce695716cd03
```

The repository-pinned environment was also read directly:

```text
Lean:    leanprover/lean4:v4.34.0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

No `lake update` or dependency upgrade was introduced.

The new branch was created from the exact F05 seal. Initial compare was:

```text
status:     identical
ahead:      0
behind:     0
merge base: 26f3e8818a5b96bc8cebf4edf72d43c124543832
```

## CI implementation

F06 adds exactly one workflow:

```text
.github/workflows/formal-verification.yml
```

It deliberately separates:

```text
formal-lean
runtime-contracts
```

The formal job uses the repository `lean-toolchain`, committed Lake manifest, and exact mathlib pin. It explicitly runs `lake build`, all three required direct Lean module checks, and a source-limited failing placeholder gate.

The runtime job requests Node.js 22 and explicitly runs all four canonical Node verifiers plus the five existing syntax checks. No `package.json`, npm project, or new dependency system is introduced.

## First real GitHub Actions candidate run

The workflow was pushed on the F06 implementation commit itself. GitHub created:

```text
run ID:   35003906913
head SHA: 66ad46f520ff80c04673c375c7801723ba0b9aed
event:    push
status:   completed
result:   success
```

This is the mandatory new F06 evidence. It is not inherited from F05 Codespaces execution.

### Formal job

```text
job:    formal-lean
job ID: 104498766094
result: success
```

Observed environment:

```text
Lean 4.34.0
Lean commit 293d5d0c0c3f3dded4688b3ccd6a33939ac5102b
Lake 5.0.0-src+293d5d0
mathlib 7801e8406155c31b340d28e2762f754d02b5e9b0
```

Required build result:

```text
Build completed successfully (8929 jobs).
```

These commands then completed successfully:

```bash
lake env lean SelfSimilarCY/CoordinatePower.lean
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
lake env lean SelfSimilarCY/PullbackTower.lean
```

The placeholder scan reported:

```text
Lean placeholder gate: passed
```

### Runtime job

```text
job:    runtime-contracts
job ID: 104498766196
result: success
```

The requested Node major was `22`; GitHub Actions resolved:

```text
v22.23.2
```

All four runtime verifiers passed, as did syntax checks for:

```text
scene-spec.js
base-renderer.js
one-step-pullback.js
recursive-lazy-expansion.js
app.js
```

## Bridge matrix preservation

The F05 matrix was exact-read from the F06 branch after implementation. Its blob SHA remained:

```text
0fc903f7c3892b83665ec28cee5c5f588ec77aff
```

The matrix remains 22 rows with exactly:

```text
EXACT_BRIDGE:      4
PARTIAL_BRIDGE:    3
ENGINEERING_ONLY:  5
FORMAL_ONLY:       3
UNFORMALIZED:      3
NO_BRIDGE:         4
```

No classification was modified to make CI appear more complete. Historical staging-era `sealStatus` metadata in that F05 matrix is preserved byte-for-byte; F06 does not retroactively rewrite historical artifacts. The canonical final F05 state/audit/progress remain the seal authority.

## Scope compare

The implementation candidate compared to sealed F05 as:

```text
status:     ahead
ahead:      1
behind:     0
merge base: 26f3e8818a5b96bc8cebf4edf72d43c124543832
```

At that point the only changed file was:

```text
.github/workflows/formal-verification.yml
```

The F06 sealing tree adds only the three required v0.06 documentation/state artifacts. The final intended changed-file set is therefore exactly:

```text
.github/workflows/formal-verification.yml
docs/GITHUB_CI_FORMAL_VERIFICATION_SEAL_self_similar_cy_visualizer_v0_06.md
docs/state_formal_verification_self_similar_cy_visualizer_v0_06.json
docs/progress_formal_verification_self_similar_cy_visualizer_v0_06.md
```

There are no Lean theorem source changes, runtime semantic source changes, `data/system.json` changes, dependency upgrades, bridge-matrix changes, README changes, or later-milestone additions.

## Semantic boundary

A green F06 workflow means:

```text
Engineering verification: passed
Formal Lean verification: passed
F05 bridge boundary: preserved
```

It does not mean all visualizer mathematics is formally verified. `W`, concrete Calabi–Yau geometry, map degree, sheet geometry, coverings, étale structure, torus restrictions, Jacobians, differentials, metric scaling, browser rendering, Three.js/WebGL, and UI correctness remain outside this seal exactly as recorded by F05.

## Local execution note

The assistant execution surface for this thread has no direct shell checkout of the private repository. A separate local terminal regression is therefore not counted. The actual GitHub Actions candidate run executed the exact required Lean and Node commands on the candidate commit and provides the mandatory F06 executable evidence.

## Seal decision

All F06 acceptance gates are satisfied:

```text
exact F05 parent                         passed
clean F06 ancestry                       passed
pinned Lean/mathlib                      passed
lake build                               passed
three direct Lean module checks          passed
placeholder gate                         passed
four Node verifiers                      passed
actual Actions formal-lean               passed
actual Actions runtime-contracts         passed
F05 bridge matrix unchanged              passed
final scope compare                       passed
forbidden scope expansion absent         passed
```

Therefore:

\[
\boxed{\textbf{F06 GitHub CI Integration & Formal Verification Seal: PASSED / SEALED}}
\]

Publication to `main` is permitted only by a fresh ancestry check and non-force fast-forward. After publication, canonical `main` must be read back and compared with `formal-f06-github-ci-seal` as identical.

F06 ends here. No subsequent formalization milestone is started in this thread.
