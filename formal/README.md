# Formal Verification

Status: **formal-v0.03 / Thread F03 — Iteration Theorem (implementation staged / unsealed)**

This directory is the isolated Lean 4 + Lake + mathlib verification layer for the Self-Similar Calabi–Yau Visualizer.

F01 remains sealed as the reproducible toolchain bootstrap. F02 remains sealed as the unique canonical definition of the four-coordinate power map

\[
P_D(z_1,z_2,z_3,z_4)=(z_1^D,z_2^D,z_3^D,z_4^D).
\]

F03 does not redefine that map. It adds only the iteration theorem for the existing `coordinatePower` definition.

## Pinned environment

The sealed F01 environment is unchanged:

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

## F03 staged theorem source

`SelfSimilarCY/CoordinatePowerIteration.lean` stages the pointwise theorem

```lean
theorem coordinatePower_iterate_apply
    (D n : ℕ) (z : Point4) (i : Fin 4) :
    (coordinatePower D)^[n] z i = z i ^ (D ^ n)
```

and its direct extensional corollary

```lean
theorem coordinatePower_iterate
    (D n : ℕ) :
    (coordinatePower D)^[n] = coordinatePower (D ^ n)
```

The proof uses natural-number induction, the pinned `Function.iterate` semantics, function extensionality, and ordinary power laws. No hypothesis `D >= 2` is introduced because the mathematical statement is valid for every `D : ℕ`, including `D = 0` and `D = 1`. The cases `n = 0` and `n = 1` are also covered by the same theorem.

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

No `axiom`, `sorry`, `admit`, or opaque placeholder is introduced by the staged F03 source.

## Verification status

The F03 source has **not yet been executed with Lean/Lake in this thread**. The current ChatGPT execution environment has Node available but does not provide `lean` or `lake`.

Therefore the canonical F03 state remains:

```text
implementation_staged / unsealed
```

The required sealing commands are:

```bash
cd formal
lake build
lake env lean SelfSimilarCY/CoordinatePowerIteration.lean
cd ..
node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js
```

Only actual successful execution evidence may advance F03 to `passed / sealed`.

## Next milestone after seal

After F03 is genuinely sealed, the next formal milestone is **F04 — Pullback Tower**. F03 itself stops at

\[
(P_D)^{[n]}=P_{D^n}.
\]
