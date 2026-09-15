# Formal Artifact Recovery Plan — R01 v0.01

## Project

Self-Similar Calabi–Yau Visualizer

Recovery branch: `formal-doc-recovery-r01`

R01 base `main` commit:

```text
b85c295540996612633bf7d702098ba9634882fe
formal: seal F03 iteration theorem
```

## Purpose

This recovery milestone exists because `@Documents` / personal-document exact retrieval may fail even when a historical artifact still exists in the canonical GitHub repository. R01 therefore treats GitHub canonical repository content as the recovery authority and records exact repository identity without rewriting historical source content.

The distinction is strict:

```text
@Documents retrieval failure != canonical GitHub artifact absence
```

## Recovery-only rule

R01 performs exact recovery only. It does not repair, normalize, reinterpret, or rewrite recovered historical files.

For every target, recovery evidence is tied to an immutable Git ref and the Git blob SHA returned by GitHub. Historical source files remain byte/content-unmodified by R01.

## Historical integrity rule

If recovered sources disagree in narrative status, R01 records only a `historical inconsistency candidate`. It does not decide which historical statement should replace another.

The required order is:

```text
recover first
audit later
repair only after audit
```

## Recovery target set

The seven targets are:

1. `docs/FORMAL_VERIFICATION_PLAN_self_similar_cy_visualizer_v0_01.md`
2. `docs/COORDINATE_POWER_MAP_self_similar_cy_visualizer_v0_02.md`
3. `docs/state_formal_verification_self_similar_cy_visualizer_v0_02.json`
4. `docs/progress_formal_verification_self_similar_cy_visualizer_v0_02.md`
5. `docs/ITERATION_THEOREM_self_similar_cy_visualizer_v0_03.md`
6. `docs/state_formal_verification_self_similar_cy_visualizer_v0_03.json`
7. `docs/progress_formal_verification_self_similar_cy_visualizer_v0_03.md`

All seven were exact-fetched from the immutable R01 base ref before this recovery metadata was created.

## Classification rule

Each target is classified as exactly one of:

```text
A. exact_canonical_retrieval
B. canonical_file_present_but_content_read_failure
C. missing_from_current_canonical_repository
D. path_or_name_mismatch_requires_audit
```

R01 may report `passed` only when all seven targets are class A. Otherwise it may seal only as `partial` with the unresolved targets explicitly listed.

## Observed historical inconsistency candidate

The recovered F02 theorem document records `implementation staged / execution pending`, while the recovered F02 state and progress artifacts record `passed / sealed`. R01 preserves all three sources exactly and records this only as a historical inconsistency candidate for R02.

No content correction is permitted in R01.

## Branch discipline

`formal-doc-recovery-r01` was created directly from the current canonical `main` HEAD recorded above. R01 must remain a pure successor of that base and must not derive from an implementation branch such as `formal-f04-pullback-tower`.

## Scope boundary

R01 may change only recovery metadata under `docs/recovery/`.

It must not modify:

- `formal/SelfSimilarCY/*.lean`
- `formal/lean-toolchain`
- `formal/lakefile.toml`
- `formal/lake-manifest.json`
- runtime JavaScript
- historical verifiers
- any of the seven recovered historical source files

R01 introduces no mathematical claim, no formal theorem, no CI change, and no runtime change.

## Verification protocol

Before sealing, R01 verifies:

1. all seven targets are exact-fetched at the recorded immutable Git ref;
2. each target has a recorded Git blob SHA;
3. recovery metadata can be read back from the branch;
4. compare from R01 base `main` to the R01 candidate changes only `docs/recovery/*`;
5. none of the seven historical source files changed;
6. no formal/runtime/dependency/CI file changed;
7. the branch remains a pure successor of the recorded R01 base.

## Verified result

R01 verification completed with:

```text
7/7 targets = A. exact_canonical_retrieval
recovery metadata readback = passed
base-to-candidate compare = ahead 3 / behind 0 before sealing
merge-base = b85c295540996612633bf7d702098ba9634882fe
changed files = exactly docs/recovery/*
historical source modifications = none
formal/runtime/dependency/CI modifications = none
```

The recovery milestone is therefore eligible for sealing as:

```text
status: passed
canonicalState: sealed
```

Publication to `main` remains constrained to a non-force fast-forward after the final sealing commit and final compare audit.

## R01 / R02 / R03 division

- **R01 — Exact Canonical Recovery**: recover and record exact canonical identities only.
- **R02 — Historical Consistency Audit**: compare plan, theorem document, state, progress, Lean source, execution transcript, and commit history; classify stale narrative, superseded status, historical-but-valid mismatch, or contradiction.
- **R03 — Documents Rematerialization**: create new copies suitable for reliable `@Documents` exact tagging without rewriting the canonical historical originals.

## Stop point

R01 stops immediately after recovery metadata is verified, sealed, and published by non-force fast-forward. It does not begin R02 analysis or R03 rematerialization.
