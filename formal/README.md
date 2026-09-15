# Formal Verification

Status: **formal-v0.03 / Thread F03 — Iteration Theorem (passed / sealed)**

This directory is the isolated Lean 4 + Lake + mathlib verification layer for the Self-Similar Calabi–Yau Visualizer.

F01 remains sealed as the reproducible toolchain bootstrap. F02 remains sealed as the unique canonical definition of the four-coordinate power map

\[
P_D(z_1,z_2,z_3,z_4)=(z_1^D,z_2^D,z_3^D,z_4^D).
\]

F03 does not redefine that map. It proves the iteration formula for the existing `coordinatePower` definition.

## Pinned environment

The sealed dependency environment is unchanged:

- Lean: `leanprover/lean4:v4.34.0`
- Lake: `5.0.0-src+293d5d0`
- mathlib: `7801e8406155c31b340d28e2762f754d02b5e9b0`
- dependency lock: `lake-manifest.json`

F03 does not alter dependency resolution.

## Sealed F02 dependency

`SelfSimilarCY/CoordinatePower.lean` remains the sole project-specific definition of `P_D`:

```lean
abbrev Point4 := Fin 4 → ℂ

def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

with the sealed theorems:

```lean
coordinatePower_apply
coordinatePower_unique
```

F03 does not modify this file.

## F03 theorems

`SelfSimilarCY/CoordinatePowerIteration.lean` proves:

```lean
theorem coordinatePower_iterate_apply
    (D n : ℕ) (z : Point4) (i : Fin 4) :
    (coordinatePower D)^[n] z i = z i ^ (D ^ n)
```

and the direct extensional corollary:

```lean
theorem coordinatePower_iterate
    (D n : ℕ) :
    (coordinatePower D)^[n] = coordinatePower (D ^ n)
```

The proof uses natural-number induction, the pinned `Function.iterate` semantics, the sealed coordinate formula, standard power laws, and function extensionality. No hypothesis `D >= 2` is introduced, so `n = 0`, `n = 1`, `D = 0`, and `D = 1` are covered by the same theorem under ordinary Lean semantics.

## Verification evidence

F03 was executed in GitHub Codespaces on the exact implementation commit:

```text
f314d20d128cf27f46bb9f603364a6b8bf0b2ee0
```

with parent:

```text
5904db171c96f130ea0c39b124c83751931a23ee
```

and a clean working tree.

The project toolchain resolved to Lean 4.34.0 and Lake `5.0.0-src+293d5d0`.

The required Lean build reported:

```text
Build completed successfully (8928 jobs).
```

The direct module command:

```bash
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
```

completed without Lean diagnostics.

The fresh historical Node regression suite then reported all four gates passed:

```text
scene-spec v0.03 verification: passed
base-renderer v0.04 verification: passed
one-step pullback v0.05 verification: passed
recursive lazy expansion v0.06 verification: passed
```

A source scan found no `axiom`, `sorry`, or `admit` in the F03 theorem module.

Therefore the canonical F03 status is:

```text
passed / sealed
```

## F03 scope boundary

F03 does **not** formalize:

- the pullback tower `X_n`;
- `W` or Calabi–Yau geometry;
- preimage identities;
- nonvanishing/torus structure;
- map degree or a theorem `deg(P_D)=D^4`;
- iterated degree;
- metric pullback or `D^2` scaling;
- Jacobians, sheets, renderer geometry, recursive visualization, or a JS↔Lean bridge;
- GitHub Actions or CI.

No runtime JavaScript, dependency pin, or CI configuration is changed by F03.

## Next milestone

The next formal milestone is **F04 — Pullback Tower**. F03 itself stops at

\[
(P_D)^{[n]}=P_{D^n}.
\]
