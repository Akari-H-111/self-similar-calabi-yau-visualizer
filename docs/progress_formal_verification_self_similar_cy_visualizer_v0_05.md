# Formal Verification Progress — v0.05

## Milestone

**Thread F05 — Contract Bridge Audit**

Status: **audit complete / fresh Node + placeholder scan passed / fresh Lean regression pending / unsealed**

Date: 2026-09-15

Canonical F04 parent:

```text
f1602a09ea24e4d71b9352dfc0c3c2602094ed56
formal: seal F04 pullback tower
```

Working branch:

```text
formal-f05-contract-bridge-audit
```

## Gate 0

Canonical GitHub `main` was exact-read and confirmed at the F04 seal above, whose sole parent is:

```text
db443db8e21149fbd41d02a500f19a0193b5b7e1
formal: linearize F04 pullback tower after recovery audit
```

The F04 state exact-read as `status = passed`, `canonicalState = sealed`, and `verifiedImplementationCommit = db443db8e21149fbd41d02a500f19a0193b5b7e1`.

The F05 branch was created from that exact HEAD. Its initial compare against `main` was `identical`, with the same merge base.

## Exact source and bridge audit

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

The audit conclusions remain unchanged by execution work. In particular, runtime `D^2`, `D^4`, and `(D^4)^n` are not promoted to metric or map-degree theorems; `W` and concrete Calabi–Yau geometry remain unformalized/no-bridge.

## Fresh canonical Node execution

The available shell has Node but no Lean/Lake and no outbound network access. To avoid treating a hand-rewritten script as canonical evidence, the runtime and verifier files were reconstructed from the exact GitHub file contents and then checked with `git hash-object` **before execution**.

The following 11 blobs matched the canonical GitHub blob SHAs byte-for-byte:

```text
scene-spec.js                                    79b5dd5a179171dd7e46f92fe0d918d38f3dc515
base-renderer.js                                 fea92139c2a8514f01b9bb187f27bf0131dd4114
one-step-pullback.js                             b0edcc433646a69ba721eaf216488e857f0c6bed
recursive-lazy-expansion.js                      0978c7a96fb007cefa683d48974f8dc401d23916
app.js                                           692e780ed419ec62b1641da3028fae41f7ac385c
index.html                                       620848b389c72cbc732597074ad1fcc90a0f1819
data/system.json                                 97ff6023b95a804528f40c69691a41bcdfbdfe27
verify_scene_spec_v0_03.js                       fb946191448b73d93e5bc1f19c2f6fd227117d29
verify_base_renderer_v0_04.js                    4595006d5523a84495d3725d5b7e18ea30998e2d
verify_one_step_pullback_v0_05.js                103db4c64de5a2a309d7182cb15356d6f7e54a7f
verify_recursive_lazy_expansion_v0_06.js         2f8d0c3314eee77e3757e5641b69936ba4f66685
```

Fresh execution then reported:

```text
scene-spec v0.03 verification: passed
base-renderer v0.04 verification: passed
one-step pullback v0.05 verification: passed
recursive lazy expansion v0.06 verification: passed
```

The five historical JavaScript syntax checks also passed:

```text
node --check scene-spec.js
node --check base-renderer.js
node --check one-step-pullback.js
node --check recursive-lazy-expansion.js
node --check app.js
```

This is fresh F05 Node evidence on byte-for-byte canonical blobs. It is not historical F04 evidence.

## Fresh placeholder scan

The four canonical Lean source blobs under `formal/SelfSimilarCY` were likewise reconstructed and SHA-checked before scanning:

```text
Basic.lean                         84bc2ca172a871890ef9753f2c0d9db84a7dec5e
CoordinatePower.lean               dcfae8a3ed99544e50ee45aa12acde63e41090c8
CoordinatePowerIteration.lean      4c78793d586e8ba822d4b326f09fd82dc07eaaf9
PullbackTower.lean                 1de5fed3c38e67c89d1c8673c7515f312a7af3e0
```

The fresh command-line scan

```bash
grep -RInE '\b(axiom|sorry|admit)\b' formal/SelfSimilarCY
```

produced no matches. Placeholder scan therefore passes on byte-for-byte canonical Lean source.

## Remaining mandatory Lean gate

The current execution environment contains no `lean`, `lake`, or `elan`. Outbound DNS/network access is unavailable, so the pinned Lean 4.34.0 toolchain cannot be installed into this shell. No existing GitHub Actions workflow exists, and F05 is forbidden from introducing one because CI creation belongs to F06.

Therefore these commands remain genuinely pending:

```bash
cd formal
lake build
lake env lean SelfSimilarCY/CoordinatePower.lean
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
lake env lean SelfSimilarCY/PullbackTower.lean
```

The actual repository checkout must also finish with a clean `git status` before sealing. Historical F04 Lean execution is not substituted for this fresh F05 gate.

## Scope discipline

F05 remains audit/documentation-only. No Lean theorem source, runtime JavaScript, `data/system.json`, dependency file, or GitHub Actions workflow is modified. F06 work has not begun.

## Current decision

The bridge audit, fresh canonical Node regression, syntax checks, and fresh canonical placeholder scan have passed. The fresh Lean execution gate remains unavailable and mandatory.

```text
F05 CONTRACT BRIDGE AUDIT:
AUDIT COMPLETE / NODE + PLACEHOLDER PASSED / LEAN REGRESSION PENDING / UNSEALED
```

No sealing commit and no non-force fast-forward of `main` is permitted yet.

The next milestone, only after the remaining F05 gates pass and F05 is sealed, remains:

```text
F06 — GitHub CI Integration & Formal Verification Seal
```
