# Historical Consistency Audit — R02 v0.02

## Project

Self-Similar Calabi–Yau Visualizer

Milestone: **R02 — Historical Consistency Audit**

Branch: `formal-doc-recovery-r02`

Status: **PASSED / SEALED**

R02 base `main`:

```text
234f7829cb6b5fb3af8c84234a84e73fa9397db9
docs: seal R01 exact formal artifact recovery
```

## Executive verdict

R01 was independently confirmed as `passed / sealed` before this audit began. Its manifest is the recovery-provenance authority and records all seven R01 historical targets as exact canonical retrievals.

R02 audited F01, F02, and F03 across the required dimensions A–O by exact-reading the recovered historical documents, the actual Lean project sources, dependency lock files, and relevant Git commits/ancestry.

The staged classification result is:

```text
CONSISTENT:            38
STALE_NARRATIVE:       2
SUPERSEDED:            0
HISTORICAL_BUT_VALID:  2
ACTUAL_CONTRADICTION:  0
UNVERIFIABLE:          3
TOTAL CLAIMS AUDITED:  45
```

No actual contradiction was found.

The only substantive historical discrepancy is the F02 theorem document's preserved pre-seal status language. Git history shows that this document was created at the implementation-stage commit, while the immediately following sealing commit updated F02 state/progress and formal README but deliberately did not rewrite the theorem document. This is therefore classified as `STALE_NARRATIVE`, not `ACTUAL_CONTRADICTION`.

Execution narratives for F01–F03 are mutually coherent with the repository state, but an independent Codespaces transcript is not exact-retrievable in the current R02 thread. Those execution-evidence dimensions are therefore conservatively classified `UNVERIFIABLE`. R02 did not rerun Lean.

## Source set

### R01 provenance authority

- `docs/recovery/FORMAL_ARTIFACT_RECOVERY_PLAN_v0_01.md`
- `docs/recovery/formal_artifact_recovery_manifest_v0_01.json`
- `docs/recovery/progress_formal_artifact_recovery_v0_01.md`

The R01 manifest records 7/7 exact canonical retrieval, no unresolved target, historical source modifications = false, and recovery-only scope.

### Historical formal documents

F01:
- `docs/FORMAL_VERIFICATION_PLAN_self_similar_cy_visualizer_v0_01.md`
- `docs/state_formal_verification_self_similar_cy_visualizer_v0_01.json`
- `docs/progress_formal_verification_self_similar_cy_visualizer_v0_01.md`

F02:
- `docs/COORDINATE_POWER_MAP_self_similar_cy_visualizer_v0_02.md`
- `docs/state_formal_verification_self_similar_cy_visualizer_v0_02.json`
- `docs/progress_formal_verification_self_similar_cy_visualizer_v0_02.md`

F03:
- `docs/ITERATION_THEOREM_self_similar_cy_visualizer_v0_03.md`
- `docs/state_formal_verification_self_similar_cy_visualizer_v0_03.json`
- `docs/progress_formal_verification_self_similar_cy_visualizer_v0_03.md`

### Actual formal source and dependency state

- `formal/README.md`
- `formal/lakefile.toml`
- `formal/lean-toolchain`
- `formal/lake-manifest.json`
- `formal/SelfSimilarCY.lean`
- `formal/SelfSimilarCY/Basic.lean`
- `formal/SelfSimilarCY/CoordinatePower.lean`
- `formal/SelfSimilarCY/CoordinatePowerIteration.lean`

### Git commits audited

```text
5b60214bb0f108ee111e3f1e78bbf2c9f10d5cce  recursive: add verified v0.06 lazy expansion
↓
04d66ee225426b03296c0cf61247de3d567b23d1  formal: bootstrap Lean mathlib verification environment
↓
e3904e06c2a7dc1c5107c6e6cd5aecba2af1d283  formal: stage F02 canonical coordinate power map
↓
5904db171c96f130ea0c39b124c83751931a23ee  formal: seal F02 coordinate power map
↓
f314d20d128cf27f46bb9f603364a6b8bf0b2ee0  formal: stage F03 iteration theorem
↓
b85c295540996612633bf7d702098ba9634882fe  formal: seal F03 iteration theorem
↓
[R01 recovery-only commits]
↓
234f7829cb6b5fb3af8c84234a84e73fa9397db9  docs: seal R01 exact formal artifact recovery
```

## Timeline reconstruction

### F01 — Bootstrap

```text
canonical parent
5b60214...
↓
single bootstrap implementation/seal commit
04d66ee...
↓
F01 passed / sealed
↓
F02 eligible
```

The bootstrap commit is a one-commit milestone. Its sole parent is `5b60214...`; the corresponding branch `formal-f01-bootstrap` still points to `04d66ee...`. F01 adds the isolated formal project, dependency lock/toolchain, smoke example, F01 documents, and `.gitignore` rule. No project-specific theorem is present.

### F02 — Coordinate Power Map

```text
sealed F01 parent
04d66ee...
↓
implementation staged
e3904e06...
  └─ theorem document says staged / execution pending
↓
execution reported by historical state/progress
↓
seal
5904db17...
  ├─ state → passed / sealed
  ├─ progress → passed / sealed
  └─ theorem document intentionally unchanged
↓
main fast-forwarded historically
```

The stage-to-seal relation is direct: the F02 seal commit's sole parent is the F02 implementation commit. The seal commit changes only F02 progress, F02 state, and `formal/README.md`; it does not modify `COORDINATE_POWER_MAP_self_similar_cy_visualizer_v0_02.md`.

This resolves the known R01 candidate temporally.

### F03 — Iteration Theorem

```text
sealed F02 parent
5904db17...
↓
implementation staged
f314d20d...
↓
execution reported by historical theorem/state/progress
↓
seal
b85c295...
  ├─ theorem document → passed / sealed
  ├─ state → passed / sealed
  ├─ progress → passed / sealed
  └─ formal README updated
↓
R01 later begins from this sealed state
```

The F03 seal commit directly follows the F03 implementation commit and, unlike F02, explicitly updates the theorem document from staged/unsealed to passed/sealed.

## F01 audit

F01 identity, canonical parent, sealed state, toolchain pins, changed-file scope, and next-milestone sequencing are coherent.

At the historical F01 commit, `formal/SelfSimilarCY.lean` imports only `SelfSimilarCY.Basic`. `Basic.lean` contains only a Mathlib import and the smoke example `1 + 1 = 2`. Therefore F01's claim that no project-specific formal theorem had begun is source-supported.

The dependency state is also source-supported:

```text
Lean:    leanprover/lean4:v4.34.0
Lake:    5.0.0-src+293d5d0   (historical execution narrative)
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

The independent execution transcript is unavailable in the current thread, so the execution-evidence dimension is `UNVERIFIABLE` rather than silently promoted to `CONSISTENT`.

F01's statement that F02 is the next milestone is `HISTORICAL_BUT_VALID`: it accurately records the closure-time sequence even though F02 and F03 were later completed.

## F02 audit

### Mathematical source

The exact Lean source defines:

```lean
abbrev Point4 := Fin 4 → ℂ
```

and:

```lean
def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

The source theorem names and scopes are exactly:

```text
coordinatePower_apply
coordinatePower_unique
```

No `D >= 2` hypothesis appears in the Lean map. The runtime restriction is not promoted to a theorem prerequisite.

The F02-sealed root import includes `Basic` and `CoordinatePower`, but not `CoordinatePowerIteration` or any pullback module. The F02 source contains no degree theorem, metric theorem, pullback tower, `W`, concrete sheet theorem, renderer geometry, axiom, admitted proof, `sorry`, or opaque placeholder.

### Historical discrepancy

The theorem document retains:

```text
implementation staged / execution pending
```

while F02 state/progress retain:

```text
passed / sealed
```

This is classified twice in the A–O matrix, once for status and once for sealing state:

```text
STALE_NARRATIVE
```

Reason: the theorem document is demonstrably a pre-seal artifact created at `e3904e06...`; the seal commit `5904db17...` directly follows it and updates state/progress without modifying that theorem document. The claims refer to different lifecycle moments and are not mutually exclusive.

Repair is not required. The historical theorem document should remain immutable.

## F03 audit

The exact source proves:

```lean
theorem coordinatePower_iterate_apply
    (D n : ℕ) (z : Point4) (i : Fin 4) :
    (coordinatePower D)^[n] z i = z i ^ (D ^ n)
```

and:

```lean
theorem coordinatePower_iterate
    (D n : ℕ) :
    (coordinatePower D)^[n] = coordinatePower (D ^ n)
```

These are precisely the document claims

```text
(P_D)^[n](z)_i = z_i^(D^n)
(P_D)^[n]      = P_(D^n)
```

and the source contains no additional `D >= 2` hypothesis. Consequently `D = 0`, `D = 1`, `n = 0`, and `n = 1` require no extra theorem hypothesis under the ordinary Lean natural-power semantics used here.

The F03 source and import tree introduce no pullback tower, `W`, Calabi–Yau geometry, degree theorem, metric theorem, Jacobian theorem, sheet objects, renderer theorem, JS↔Lean bridge, or CI theorem claim.

The F03 stage and seal commits form a direct parent-child pair. The seal commit updates theorem/state/progress to passed/sealed, so no F03 status discrepancy survives in the recovered canonical files.

Again, the requested independent Codespaces transcript is unavailable in this thread. The execution-evidence dimension is therefore `UNVERIFIABLE`, even though theorem/state/progress are mutually coherent.

## Toolchain / manifest audit

The current sealed F01–F03 dependency files record:

```text
formal/lean-toolchain:
leanprover/lean4:v4.34.0

formal/lakefile.toml:
mathlib rev = 7801e8406155c31b340d28e2762f754d02b5e9b0

formal/lake-manifest.json:
mathlib rev/inputRev = 7801e8406155c31b340d28e2762f754d02b5e9b0
```

F02 and F03 Git compares contain no dependency-file changes, so the sealed dependency state remained unchanged through those milestones.

## Non-claims audit

Across the relevant F01–F03 source modules, R02 found no formalization of:

```text
W
Calabi–Yau geometry
pullback tower before F04
deg(P_D)=D^4
D^4 sheet theorem
étale / covering theorem
metric pullback theorem
P_D^* g_log = D^2 g_log
Jacobian theorem
renderer geometry
JS↔Lean formal bridge
CI theorem claim
```

The source modules also contain no project `axiom`, `sorry`, `admit`, or `opaque` placeholder.

Thus the historical non-claim boundaries are source-supported.

## Cross-artifact inconsistencies

The only classified cross-artifact inconsistency is F02 lifecycle wording:

```text
COORDINATE_POWER_MAP v0.02:
implementation staged / execution pending

state/progress v0.02:
passed / sealed
```

Git history supplies the missing temporal axis. The discrepancy is `STALE_NARRATIVE`, not contradiction.

No other silent discrepancy was identified across the 45 audited milestone/dimension claims.

## Actual contradictions

```text
ACTUAL_CONTRADICTION count: 0
```

No pair of claims was found that is impossible to reconcile by lifecycle timing, branch state, historical context, or later canonical sealing.

## Unverifiable claims

Three matrix rows remain `UNVERIFIABLE`, all in dimension L (execution evidence):

- F01 execution evidence;
- F02 execution evidence;
- F03 execution evidence.

Canonical documents contain internally coherent execution narratives, but the requested independent Codespaces transcript is unavailable for exact retrieval in this R02 thread. R02 therefore does not treat those narratives as their own independent witness and does not rerun Lean merely to recreate historical evidence.

This is an evidence-availability classification, not a finding that the historical execution claims are false.

## Recommended R03 handling

R03 may proceed to Documents rematerialization after R02 is sealed.

The rematerialized copies should:

1. preserve the original historical text byte/content-wise;
2. attach GitHub canonical provenance from R01;
3. attach R02 classification metadata without rewriting historical prose;
4. for F02 specifically, note that the theorem document's status line is authentic pre-seal narrative and link the later F02 seal state/progress/commit;
5. preserve `UNVERIFIABLE` execution-witness status unless an exact transcript is later recovered.

R02 does **not** recommend R04 repair on the present evidence because no `ACTUAL_CONTRADICTION` exists. If a future source reveals a genuine contradiction, a separate reconciliation/repair milestone may be opened without altering this audit's historical record.

## Final seal decision

The staged R02 artifacts were read back successfully.

The R01 sealed base → R02 staged-candidate compare reported:

```text
status:       ahead
ahead_by:     1
behind_by:    0
merge-base:   234f7829cb6b5fb3af8c84234a84e73fa9397db9
changed files: exactly 3
```

The three changed files are exactly the R02 audit artifacts under `docs/recovery/*`. No historical canonical artifact, formal source, runtime source, verifier, dependency file, or CI file changed.

All audit-completeness gates are therefore satisfied. The presence of three `UNVERIFIABLE` execution-witness rows does not fail R02 because those claims are explicitly marked unresolved rather than silently treated as verified.

Final R02 state:

```text
status: passed
canonicalState: sealed
ACTUAL_CONTRADICTION: 0
historical sources modified: false
formal source modified: false
runtime/dependencies/CI modified: false
next recovery milestone: R03 — Documents Rematerialization
```

R02 stops here after non-force fast-forward publication to `main`. No historical source repair is performed.