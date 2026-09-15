# Historical Consistency Audit Progress — R02 v0.02

## Milestone

**R02 — Historical Consistency Audit**

Status: **passed / sealed**

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

## R02 artifacts

R02 adds only:

- `docs/recovery/HISTORICAL_CONSISTENCY_AUDIT_v0_02.md`
- `docs/recovery/historical_consistency_matrix_v0_02.json`
- `docs/recovery/progress_historical_consistency_audit_v0_02.md`

No historical artifact is modified.

## Seal gates

The staged artifacts were read back successfully.

R01 sealed base → staged R02 candidate:

```text
base:       234f7829cb6b5fb3af8c84234a84e73fa9397db9
candidate:  e18dc0ebc9ce1fb72dcd8b342516ee65d12b0672
status:     ahead
ahead_by:   1
behind_by:  0
merge-base: 234f7829cb6b5fb3af8c84234a84e73fa9397db9
```

Changed files were exactly the three R02 `docs/recovery/*` artifacts.

Therefore:

```text
artifact_readback:                    passed
changed_files_only_docs/recovery:     passed
historical_sources_unchanged:         passed
formal_source_unchanged:              passed
runtime_verifiers_unchanged:          passed
dependency_files_unchanged:           passed
CI_unchanged:                         passed
F04_F05_F06_work_introduced:          false
audit_completeness:                   passed
```

## Seal decision

R02 succeeds because all recognizable discrepancies have been sourced, temporalized, and classified without rewriting history or guessing repairs.

```text
status: passed
canonicalState: sealed
```

Publication is restricted to a non-force fast-forward of `main` after the seal-candidate compare confirms pure successor ancestry.

After publication R02 stops. The next recovery milestone is **R03 — Documents Rematerialization**.