# Formal Verification Progress — v0.05

## Milestone

**Thread F05 — Contract Bridge Audit**

Status: **passed / sealed**

Date: 2026-09-16

Canonical F04 parent:

```text
f1602a09ea24e4d71b9352dfc0c3c2602094ed56
formal: seal F04 pullback tower
```

Verified F05 candidate:

```text
cbb03ba1570ca2ad226024d59fc4ce695716cd03
formal: record F05 fresh executable audit evidence
```

Working branch:

```text
formal-f05-contract-bridge-audit
```

## Source and bridge audit

All requested runtime JS/JSON, historical Node verifiers, runtime specifications, formal F01–F04 documentation/state/progress, dependency pins, and sealed F02–F04 Lean source were read from canonical GitHub paths. Repository search found no `iteratedDegreeIdentity`.

The machine-readable bridge matrix remains **22 rows**:

```text
EXACT_BRIDGE:      4
PARTIAL_BRIDGE:    3
ENGINEERING_ONLY:  5
FORMAL_ONLY:       3
UNFORMALIZED:      3
NO_BRIDGE:         4
```

The audit conclusions are unchanged by execution. Runtime `D^2`, `D^4`, and `(D^4)^n` remain unformalized as metric/map-degree claims; `W` and concrete Calabi–Yau geometry remain outside the sealed formal model.

## Fresh executable evidence

Fresh Node verification was performed on byte-for-byte canonical runtime/verifier blobs and later repeated on the actual F05 checkout. All four verifiers passed:

```text
scene-spec v0.03 verification: passed
base-renderer v0.04 verification: passed
one-step pullback v0.05 verification: passed
recursive lazy expansion v0.06 verification: passed
```

The five historical JavaScript syntax checks also passed.

The four Lean theorem-source blobs under `formal/SelfSimilarCY` were SHA-checked against canonical GitHub. A fresh placeholder scan found no `axiom`, `sorry`, or `admit` matches.

The final mandatory Lean gate was then executed in the actual Codespace checkout of F05 candidate `cbb03ba1570ca2ad226024d59fc4ce695716cd03`, with repository-pinned Lean 4.34.0 and Lake 5.0.0:

```bash
cd formal
lake build
lake env lean SelfSimilarCY/CoordinatePower.lean
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
lake env lean SelfSimilarCY/PullbackTower.lean
```

Observed result:

```text
Build completed successfully (8929 jobs).
```

All three direct Lean module compilations completed without errors.

The same checkout then passed all four Node verifiers and ended with:

```text
On branch formal-f05-contract-bridge-audit
Your branch is up to date with 'origin/formal-f05-contract-bridge-audit'.

nothing to commit, working tree clean
cbb03ba1570ca2ad226024d59fc4ce695716cd03
```

## Scope and compare

The F05 candidate remains documentation/audit-only. No Lean theorem source, runtime JavaScript, `data/system.json`, dependency file, or GitHub Actions workflow was modified. F06 work was not introduced.

Repository-side compare from sealed F04 main to the verified F05 candidate is linear and contains only the four F05 artifacts:

```text
docs/CONTRACT_BRIDGE_AUDIT_self_similar_cy_visualizer_v0_05.md
docs/contract_bridge_matrix_self_similar_cy_visualizer_v0_05.json
docs/state_formal_verification_self_similar_cy_visualizer_v0_05.json
docs/progress_formal_verification_self_similar_cy_visualizer_v0_05.md
```

## Decision

All F05 acceptance gates have passed:

```text
source audit            = passed
bridge matrix           = passed
non-claim discipline    = passed
fresh Node regression   = passed
fresh placeholder scan  = passed
fresh Lean regression   = passed
clean working tree      = passed
scope compare            = passed
```

Therefore:

```text
F05 CONTRACT BRIDGE AUDIT:
PASSED / SEALED
```

The next milestone is:

```text
F06 — GitHub CI Integration & Formal Verification Seal
```
