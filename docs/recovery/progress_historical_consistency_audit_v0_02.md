# Historical Consistency Audit Progress — R02 v0.02

## Milestone

**R02 — Historical Consistency Audit**

Status: **staged / unsealed**

Branch:

```text
formal-doc-recovery-r02
```

Canonical R02 base:

```text
234f7829cb6b5fb3af8c84234a84e73fa9397db9
docs: seal R01 exact formal artifact recovery
```

## Gate 0 — R01 prerequisite

Passed.

Current `main` was read directly before R02 work and resolved to the R01 sealing commit above. R01's three recovery artifacts exist under `docs/recovery/`; its manifest records:

```text
status: passed
canonicalState: sealed
A exact canonical retrieval: 7
unresolved targets: 0
```

The R01 base-to-seal compare changes only the three R01 `docs/recovery/*` metadata files.

## R02 branch discipline

`formal-doc-recovery-r02` was created directly from the exact R01 sealed `main` HEAD.

At creation:

```text
R02 branch HEAD = 234f7829cb6b5fb3af8c84234a84e73fa9397db9
main HEAD       = 234f7829cb6b5fb3af8c84234a84e73fa9397db9
difference      = none
```

No F04 implementation branch was used as a base.

## Sources audited

R02 exact-read:

- R01 recovery plan/manifest/progress;
- F01 plan/state/progress;
- F02 theorem/state/progress;
- F03 theorem/state/progress;
- formal README;
- Lake/toolchain/manifest files;
- `SelfSimilarCY.lean`;
- `Basic.lean`;
- `CoordinatePower.lean`;
- `CoordinatePowerIteration.lean`;
- relevant F01/F02/F03 commits and branch pointers.

The requested independent F03 Codespaces transcript could not be exact-retrieved in the current thread:

```text
execution witness unavailable in current thread
```

It was therefore not fabricated or substituted.

## Timeline audit

Verified linear milestone ancestry:

```text
5b60214...
→ 04d66ee...  F01 bootstrap
→ e3904e06... F02 implementation staged
→ 5904db17... F02 sealed
→ f314d20d... F03 implementation staged
→ b85c295...  F03 sealed
```

Each implementation/seal relation audited above is direct parent-child ancestry where applicable.

F02 seal modifies state/progress/README but not the F02 theorem document. F03 seal modifies theorem/state/progress/README.

## Mathematical audit result

F02 source matches the historical mathematical description:

```text
Point4 := Fin 4 → ℂ
coordinatePower (D : ℕ) (z : Point4) := fun i => z i ^ D
coordinatePower_apply
coordinatePower_unique
```

F03 source matches:

```text
coordinatePower_iterate_apply
coordinatePower_iterate
```

with formulas `(P_D)^[n](z)_i = z_i^(D^n)` and `(P_D)^[n] = P_(D^n)`.

No `D >= 2` Lean hypothesis is introduced.

No pullback-tower, degree, sheet, metric, Jacobian, `W`, Calabi–Yau geometry, renderer, JS↔Lean bridge, or CI theorem is present in F01–F03 project modules. No `axiom`, `sorry`, `admit`, or `opaque` placeholder was found in those modules.

## Classification result

```text
CONSISTENT:            38
STALE_NARRATIVE:       2
SUPERSEDED:            0
HISTORICAL_BUT_VALID:  2
ACTUAL_CONTRADICTION:  0
UNVERIFIABLE:          3
TOTAL:                 45
```

Key result:

```text
F02 pre-seal theorem status vs later sealed state/progress
→ STALE_NARRATIVE
→ not ACTUAL_CONTRADICTION
```

No R04 repair is presently required.

## Staged artifacts

This staging step is limited to:

- `docs/recovery/HISTORICAL_CONSISTENCY_AUDIT_v0_02.md`
- `docs/recovery/historical_consistency_matrix_v0_02.json`
- `docs/recovery/progress_historical_consistency_audit_v0_02.md`

No historical artifact is to be modified.

## Gates remaining before seal

The staged branch must still pass:

```text
R02 artifact readback
R01 sealed base → R02 candidate compare
changed files only docs/recovery/*
historical source files unchanged
formal source unchanged
runtime/verifiers unchanged
dependency files unchanged
no F04/F05/F06 work
pure successor ancestry
current main still equals R01 sealed base before publication
```

Until then:

```text
R02 AUDIT STAGED / UNSEALED
```
