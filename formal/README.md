# Formal Verification

Status: **formal-v0.04 / Thread F04 — Pullback Tower (implementation staged / execution pending / unsealed)**

This directory is the isolated Lean 4 + Lake + mathlib verification layer for the Self-Similar Calabi–Yau Visualizer.

F01 remains sealed as the reproducible toolchain bootstrap. F02 remains sealed as the unique canonical definition of the four-coordinate power map. F03 remains sealed as the function-iteration theorem. F04 adds only an abstract set-theoretic preimage tower on top of those sealed dependencies.

## Pinned environment

The dependency environment is unchanged:

- Lean: `leanprover/lean4:v4.34.0`
- Lake: `5.0.0-src+293d5d0`
- mathlib: `7801e8406155c31b340d28e2762f754d02b5e9b0`
- dependency lock: `lake-manifest.json`

F04 does not alter dependency resolution and does not run `lake update`.

## Sealed F02/F03 dependencies

`SelfSimilarCY/CoordinatePower.lean` remains the sole project-specific definition of `P_D`:

```lean
abbrev Point4 := Fin 4 → ℂ

def coordinatePower (D : ℕ) (z : Point4) : Point4 :=
  fun i => z i ^ D
```

F03 already proves:

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

F04 imports this sealed module and does not re-prove coordinate arithmetic.

## Pinned mathlib API audit

Before F04 implementation, the exact pinned mathlib revision was checked for the native APIs used by the tower proof. The audit confirmed `Function.iterate_zero`, `Function.iterate_succ`, `Function.iterate_succ_apply`, `Set.ext`, `Set.preimage_id`, `Set.preimage_comp`, `Set.preimage_comp_eq`, `Set.preimage_iterate_eq`, and `Set.preimage_preimage`.

No theorem name or simplifier behavior is assumed from a different Lean/mathlib version.

## F04 representation

The minimal carrier is native:

```lean
Set Point4
```

with ordinary function preimage. No project-specific preimage notion is introduced.

`SelfSimilarCY/PullbackTower.lean` defines:

```lean
def pullbackTower (D : ℕ) (X : Set Point4) : ℕ → Set Point4
  | 0 => X
  | Nat.succ n => coordinatePower D ⁻¹' pullbackTower D X n
```

so mathematically:

\[
X_0=X,\qquad X_{n+1}=P_D^{-1}(X_n).
\]

## F04 staged theorems

The module exposes the recursive equations:

```lean
pullbackTower_zero
pullbackTower_succ
```

and stages the main theorem:

```lean
theorem pullbackTower_eq_iterate_preimage
    (D : ℕ) (X : Set Point4) (n : ℕ) :
    pullbackTower D X n = ((coordinatePower D)^[n]) ⁻¹' X
```

which is the formal statement

\[
X_n=((P_D)^{[n]})^{-1}(X).
\]

The F03 corollary is staged as:

```lean
theorem pullbackTower_eq_coordinatePower_preimage
    (D : ℕ) (X : Set Point4) (n : ℕ) :
    pullbackTower D X n = (coordinatePower (D ^ n)) ⁻¹' X
```

and is obtained directly by rewriting with `coordinatePower_iterate`.

No hypothesis `D >= 2` is added. The abstract statements therefore naturally include `n = 0`, `n = 1`, `D = 0`, `D = 1`, `X = ∅`, and `X = Set.univ` under ordinary Lean semantics.

## F04 execution gate

F04 is **not yet passed**. The staged branch must still produce fresh evidence for:

```bash
cd formal
lake build
lake env lean SelfSimilarCY/PullbackTower.lean
cd ..

node verify_scene_spec_v0_03.js
node verify_base_renderer_v0_04.js
node verify_one_step_pullback_v0_05.js
node verify_recursive_lazy_expansion_v0_06.js

grep -nE '\b(axiom|sorry|admit)\b' formal/SelfSimilarCY/PullbackTower.lean || true
git status
```

Historical F03 execution does not substitute for these F04 gates.

## F04 scope boundary

F04 does **not** formalize or claim:

- `W`, `W = 0`, or Calabi–Yau geometry;
- smoothness or singularity structure;
- map degree such as `deg(P_D)=D^4`;
- `D^4` sheets, sheet objects, coverings, étale structure, or torus restrictions;
- metric pullback, `D^2` scaling, Jacobians, or differentials;
- renderer geometry, WebGL, Three.js, recursive visualization, or a JS↔Lean bridge;
- GitHub Actions or CI;
- F05 Contract Bridge work.

No runtime JavaScript or dependency pin is modified by the staged F04 work.

## Current stopping point

Until fresh execution and final compare gates pass, the canonical conclusion is only:

```text
F04 IMPLEMENTATION STAGED / UNSEALED
```

The next milestone, **F05 — Contract Bridge Audit**, may begin only after F04 is sealed.
