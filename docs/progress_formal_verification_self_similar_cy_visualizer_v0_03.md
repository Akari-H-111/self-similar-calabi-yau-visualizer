# Formal Verification Progress — v0.03

## Milestone

**Thread F03 — Iteration Theorem**

Status: **passed / sealed**

Date: 2026-09-15

Canonical parent:

```text
5904db171c96f130ea0c39b124c83751931a23ee
formal: seal F02 coordinate power map
```

Verified implementation commit:

```text
f314d20d128cf27f46bb9f603364a6b8bf0b2ee0
formal: stage F03 iteration theorem
```

Working branch:

```text
formal-f03-iteration-theorem
```

## Exact repository/source audit

Before implementation, both `main` and `formal-f02-coordinate-power` were confirmed at the sealed F02 commit above, whose sole parent is `e3904e06c2a7dc1c5107c6e6cd5aecba2af1d283`. The F02 state was read as `passed / sealed`, and all requested formal/runtime canonical artifacts were retrieved from the repository. No required artifact was missing.

F03 preserves the sealed F02 definition without modification:

```lean
abbrev Point4 := Fin 4 → ℂ

def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

No competing coordinate-power definition was introduced.

## Formal result

`formal/SelfSimilarCY/CoordinatePowerIteration.lean` proves the pointwise theorem

```lean
theorem coordinatePower_iterate_apply
    (D n : ℕ) (z : Point4) (i : Fin 4) :
    (coordinatePower D)^[n] z i = z i ^ (D ^ n)
```

and the map-level corollary

```lean
theorem coordinatePower_iterate
    (D n : ℕ) :
    (coordinatePower D)^[n] = coordinatePower (D ^ n)
```

The proof uses natural-number induction, the pinned `Function.iterate` successor semantics, the sealed F02 coordinate formula, standard power laws, and function extensionality. No `D >= 2` hypothesis is added, so the theorem also covers `n = 0`, `n = 1`, `D = 0`, and `D = 1` under ordinary Lean natural-power semantics.

## Pinned environment

The F01/F02 dependency environment remained unchanged:

```text
Lean:    leanprover/lean4:v4.34.0
Lake:    5.0.0-src+293d5d0
mathlib: 7801e8406155c31b340d28e2762f754d02b5e9b0
```

The pinned mathlib source was audited before implementation; `Function.iterate_succ_apply` has the orientation used by the proof.

## Actual execution evidence

The F03 implementation commit was checked out in GitHub Codespaces with a clean working tree. The observed ancestry was:

```text
HEAD  = f314d20d128cf27f46bb9f603364a6b8bf0b2ee0
HEAD^ = 5904db171c96f130ea0c39b124c83751931a23ee
```

The toolchain resolved exactly to Lean 4.34.0 and Lake `5.0.0-src+293d5d0`.

The required Lean gates then succeeded:

```text
lake build
Build completed successfully (8928 jobs).
```

and

```text
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
```

completed without Lean diagnostics.

The fresh historical runtime regression suite also passed:

```text
scene-spec v0.03 verification: passed
base-renderer v0.04 verification: passed
one-step pullback v0.05 verification: passed
recursive lazy expansion v0.06 verification: passed
```

The working tree remained clean after verification.

## Changed-file / scope audit

Relative to sealed F02, F03 changes only:

- `formal/SelfSimilarCY/CoordinatePowerIteration.lean`;
- `formal/SelfSimilarCY.lean`;
- `formal/README.md`;
- `docs/ITERATION_THEOREM_self_similar_cy_visualizer_v0_03.md`;
- `docs/state_formal_verification_self_similar_cy_visualizer_v0_03.json`;
- `docs/progress_formal_verification_self_similar_cy_visualizer_v0_03.md`.

The implementation audit confirmed no runtime JavaScript changes, no dependency-file changes, no GitHub Actions, no pullback-tower theorem, no `W` geometry, no map-degree theorem, and no metric theorem. A source scan found no `axiom`, `sorry`, or `admit` in the F03 theorem module.

## Seal decision

All F03 acceptance gates are satisfied. Therefore:

\[
\boxed{\text{F03 Iteration Theorem: PASSED / SEALED}}
\]

The sealing commit may advance `main` only by non-force fast-forward. F03 stops here; no F04 pullback-tower content is introduced.

## Next milestone

The next formal milestone is **F04 — Pullback Tower**, which may now begin in a new thread.
